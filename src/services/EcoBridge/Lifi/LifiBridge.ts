import { Currency } from '@swapr/sdk'

import { ERC20_ABI, Step, Token } from '@lifi/sdk'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { BigNumber, Contract, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import LifiLogo from '../../../assets/images/lifi-logo.png'
import { formatGasOrFees } from '../../../utils/formatNumber'
import {
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
  LifiList,
} from '../EcoBridge.types'
import { ButtonStatus, EcoBridgeChildBase } from '../EcoBridge.utils'
import { overrideTokensAddresses } from '../Socket/Socket.utils'

import { LifiApi } from './Lifi.api'
import { LIFI_TXN_STATUS, NATIVE_TOKEN_ADDRESS, VERSION } from './Lifi.constants'
import { lifiActions } from './Lifi.reducer'
import { lifiSelectors } from './Lifi.selectors'
import { LifiQuoteRequest, LifiTransactionStatus } from './Lifi.types'
import { LifiChainShortNames, getFeeCost, isLifiChainId } from './Lifi.utils'

export class LifiBridge extends EcoBridgeChildBase {
  #abortControllers: { [id: string]: AbortController } = {}

  constructor({ supportedChains, bridgeId, displayName = 'Lifi', displayUrl }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName, displayUrl })
    this.setBaseActions(this.#actions())
  }

  #renewAbortController = (key: string) => {
    if (this.#abortControllers[key]) {
      this.#abortControllers[key].abort()
    }

    this.#abortControllers[key] = new AbortController()

    return this.#abortControllers[key].signal
  }

  #actions() {
    return lifiActions[this.bridgeId as LifiList]
  }

  #selectors() {
    return lifiSelectors[this.bridgeId as LifiList]
  }

  #pendingTxListener = async () => {
    const pendingTransactions = this.#selectors().selectPendingTransactions(this.store.getState(), this._account)
    await this.#checkBridgingStatus(pendingTransactions)
  }

  #checkBridgingStatus = async (lifiExecutedRoutes: LifiTransactionStatus[]) => {
    if (!lifiExecutedRoutes.length) return

    const promises = lifiExecutedRoutes.map(async tx => {
      try {
        const { statusRequest, statusResponse } = tx
        if (statusResponse.status !== LIFI_TXN_STATUS.DONE && statusResponse.status !== LIFI_TXN_STATUS.FAILED) {
          const result = await LifiApi.getStatus(statusRequest, { signal: this.#renewAbortController('status') })
          if (result.status === LIFI_TXN_STATUS.DONE) {
            // TODO: Need to fetch the timeResolved from toToken transaction hash onChain. Its not available from API.
            this.store.dispatch(this.#actions().updateTx({ ...result, timeResolved: Date.now() }))
          } else {
            this.store.dispatch(this.#actions().updateTx(result))
          }

          if (result.status === LIFI_TXN_STATUS.INVALID || result.status === LIFI_TXN_STATUS.NOT_FOUND) {
            this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(
              BridgeModalStatus.ERROR,
              this.bridgeId,
              result.substatusMessage
            )
          }
        }
      } catch (e) {
        console.error(`Lifi bridge: failed to get bridging status of ${tx.statusResponse.bridgeExplorerLink}`)
      }
    })

    await Promise.all(promises)
  }

  #checkAndSetAllowance = async (
    wallet: any,
    tokenAddress: string,
    approvalAddress: string,
    amount: string
  ): Promise<boolean> => {
    // Transactions with the native token don't need approval
    if (tokenAddress === ethers.constants.AddressZero) {
      return true
    }

    const erc20 = new Contract(tokenAddress, ERC20_ABI, wallet)
    const signerAddress = await wallet.getAddress()

    try {
      const approved = await erc20.allowance(signerAddress, approvalAddress)
      const allowance = BigNumber.from(approved.toString())
      if (allowance.lt(amount)) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVE)
        return false
      } else {
        return true
      }
    } catch (e) {
      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVE)
      return false
    }
  }

  #getLifiRoutes = async (request: LifiQuoteRequest) => {
    if (!this._account) return

    let step: Step
    const { requestId, ...rest } = request
    try {
      step = await LifiApi.getQuote(
        {
          ...rest,
          fromAddress: this._account,
          order: 'RECOMMENDED',
        },
        { signal: this.#renewAbortController('quote') }
      )
    } catch (e) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }
    if (step === undefined) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }

    this.store.dispatch(this.#actions().setRoute(step))

    const { id: routeId, action, estimate } = step
    const { executionDuration, toAmount, gasCosts, feeCosts, fromAmountUSD } = estimate

    const { toToken } = action

    const fee = getFeeCost(feeCosts, fromAmountUSD)

    const { amountUSD: totalGasFeeUSD } = gasCosts?.[0] ?? {}
    const formattedToAmount = Number(formatUnits(toAmount, toToken.decimals))
      .toFixed(this._receiveAmountDecimalPlaces)
      .toString()

    this.store.dispatch(
      this.baseActions.setBridgeDetails({
        fee,
        gas: formatGasOrFees(totalGasFeeUSD ?? 0),
        estimateTime: executionDuration ? `${(executionDuration / 60).toFixed(0).toString()} min` : undefined,
        receiveAmount: formattedToAmount,
        requestId,
        routeId,
      })
    )
  }
  // Initialize the bridge
  init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    // Set the initial environment
    this.setInitialEnv({ staticProviders, store })
    // Set the signer data
    this.setSignerData({ account, activeChainId, activeProvider })
    // Start the listeners
    this.ecoBridgeUtils.listeners.start([{ listener: this.#pendingTxListener }])
  }

  approve = async () => {
    try {
      const routeId = this.store.getState().ecoBridge.common.activeRouteId
      const route = this.#selectors().selectRoute(this.store.getState())
      if (!routeId || !route || route.id !== routeId) return

      const wallet = this._activeProvider?.getSigner()
      const tokenAddress = route.action.fromToken.address
      const approvalAddress = route.estimate.approvalAddress
      const amount = route.estimate.fromAmount

      const erc20 = new Contract(tokenAddress, ERC20_ABI, wallet)
      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVING)

      const approveTx = await erc20.approve(approvalAddress, amount)
      const receipt = await approveTx.wait()

      if (receipt) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  validate = async () => {
    const routeId = this.store.getState().ecoBridge.common.activeRouteId
    const route = this.#selectors().selectRoute(this.store.getState())

    //this shouldn't happen because validation on fronted not allowed to set bridge when status is "failed"
    if (!routeId || !route || route.id !== routeId) return

    try {
      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.LOADING)

      const allowanceStatus = await this.#checkAndSetAllowance(
        this._activeProvider?.getSigner(),
        route.action.fromToken.address,
        route.estimate.approvalAddress,
        route.estimate.fromAmount
      )
      if (allowanceStatus) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch (e) {
      this.ecoBridgeUtils.ui.statusButton.setError()
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, e)
    }
  }

  fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui
    if (!LifiChainShortNames.get(fromChainId) || !LifiChainShortNames.get(toChainId)) return
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.LOADING))

    let tokenList: TokenList = {
      name: 'Lifi',
      timestamp: new Date().toISOString(),
      version: VERSION,
      logoURI: LifiLogo,
      tokens: [],
    }

    // if (isBridgeSwapActive) {
    try {
      let tokens: Token[] = []
      if (isLifiChainId(fromChainId) && isLifiChainId(toChainId)) {
        const { fromChainTokens, toChainTokens } = await LifiApi.getTokenList(
          {
            fromChain: fromChainId!,
            toChain: toChainId!,
          },
          { signal: this.#renewAbortController('getTokens') }
        )
        tokens = [...fromChainTokens, ...toChainTokens]

        tokens = tokens.reduce<TokenInfo[]>((allTokens, token) => {
          const { address, chainId, symbol, decimals, logoURI, name } = token
          // remove native currency from fromTokenList
          if (address === NATIVE_TOKEN_ADDRESS && symbol === Currency.getNative(fromChainId).symbol) return allTokens

          allTokens.push({
            address,
            chainId: Number(chainId),
            symbol,
            decimals: decimals ?? 18,
            name: name ?? '',
            logoURI,
          })

          return allTokens
        }, [])
      }
      tokenList = {
        name: 'Lifi',
        timestamp: new Date().toISOString(),
        version: VERSION,
        logoURI: LifiLogo,
        tokens,
      }
    } catch (e) {
      throw this.ecoBridgeUtils.logger.error('Failed to fetch Lifi token lists')
    }

    this.store.dispatch(this.baseActions.addTokenLists({ lifi: tokenList as TokenList }))
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.READY))
  }

  getBridgingMetadata = async () => {
    const ecoBridgeState = this.store.getState().ecoBridge
    const { from, to, isBridgeSwapActive } = ecoBridgeState.ui
    const requestId = this.ecoBridgeUtils.metadataStatus.start()

    // reset previous data
    this.store.dispatch(
      this.#actions().setApprovalData({
        allowanceTarget: undefined,
        amount: undefined,
        chainId: undefined,
        owner: undefined,
        tokenAddress: undefined,
      })
    )
    this.store.dispatch(this.#actions().setRoute({} as Step))

    if (!from.chainId || !to.chainId || !this._account || !from.address || Number(from.value) === 0) return

    let value = BigNumber.from(0)

    //handling small amounts
    try {
      value = parseUnits(from.value, from.decimals)
    } catch (e) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }
    if (isBridgeSwapActive) {
      await this.#getLifiRoutes({
        fromChain: from.chainId.toString(),
        fromToken: from.address === Currency.getNative(from.chainId).symbol ? NATIVE_TOKEN_ADDRESS : from.address,
        toToken: to.address === Currency.getNative(to.chainId).symbol ? NATIVE_TOKEN_ADDRESS : to.address,
        toChain: to.chainId.toString(),
        fromAmount: value.toString(),
        requestId,
      })
    } else {
      const lifiTokens = this.store.getState().ecoBridge.lifi.lists[this.bridgeId]
      const fromNativeCurrency = Currency.getNative(from.chainId)

      let fromTokenAddress = ''
      let toTokenAddress = ''

      const overrideTokens = overrideTokensAddresses({
        toChainId: to.chainId,
        fromChainId: from.chainId,
        fromAddress: from.address,
      })

      if (overrideTokens) {
        const { fromTokenAddressOverride, toTokenAddressOverride } = overrideTokens

        fromTokenAddress = fromTokenAddressOverride
        toTokenAddress = toTokenAddressOverride
      }

      // Default pairing
      if (!toTokenAddress && !fromTokenAddress) {
        if (from.address === fromNativeCurrency.symbol) {
          fromTokenAddress = NATIVE_TOKEN_ADDRESS
          toTokenAddress = NATIVE_TOKEN_ADDRESS
        } else {
          const fromToken = lifiTokens.tokens.find(token => token.address.toLowerCase() === from.address.toLowerCase())

          if (!fromToken) {
            this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
            return
          }

          const toToken = lifiTokens.tokens.find(
            token => token.symbol === fromToken.symbol && token.chainId === to.chainId
          )

          if (!toToken) {
            this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
            return
          }

          fromTokenAddress = fromToken.address
          toTokenAddress = toToken.address
        }
      }

      await this.#getLifiRoutes({
        fromChain: from.chainId.toString(),
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        toChain: to.chainId.toString(),
        fromAmount: value.toString(),
        requestId,
      })
    }
  }

  triggerBridging = async () => {
    try {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

      const routeId = this.store.getState().ecoBridge.common.activeRouteId
      const route = this.#selectors().selectRoute(this.store.getState())
      const checkRoute = route.id === routeId

      if (!this._account || !checkRoute || !this._activeProvider || !route.transactionRequest) return
      const signer = this._activeProvider.getSigner()

      const transaction = await signer.sendTransaction(route.transactionRequest)
      const transactionReceipt = await transaction.wait()

      // Failed to do Bridge transaction
      if (!transactionReceipt) {
        this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(
          BridgeModalStatus.ERROR,
          this.bridgeId,
          'Failed to execute transaction'
        )
        return
      }

      const { hash } = transaction
      const { tool, action } = route
      const { fromChainId, toChainId } = action
      const statusRequest = {
        bridge: tool,
        txHash: hash,
        fromChain: fromChainId,
        toChain: toChainId,
      }
      const statusResponse = await LifiApi.getStatus(statusRequest, {
        signal: this.#renewAbortController('status'),
      })

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)

      this.store.dispatch(
        this.#actions().addTx({
          action,
          statusRequest,
          statusResponse,
          account: this._account,
        })
      )
      const sendingAmount = route.action.fromAmount
      const sendingTokenDecimals = route.action.fromToken.decimals
      const formattedSendingAmount = formatUnits(sendingAmount, sendingTokenDecimals)

      this.ecoBridgeUtils.ui.setModalData({
        symbol: route.action.fromToken.symbol,
        fromChainId: route.action.fromChainId,
        toChainId: route.action.toChainId,
        typedValue: formattedSendingAmount,
      })
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  fetchStaticLists = () => {
    return {} as Promise<void>
  }

  onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  collect = () => undefined
}
