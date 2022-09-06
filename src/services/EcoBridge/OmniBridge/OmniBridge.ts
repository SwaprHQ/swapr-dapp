import { formatEther, parseUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'

import { schema, TokenList } from '@uniswap/token-lists'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { BigNumber, Contract } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { request } from 'graphql-request'

import { subgraphClientsUris } from '../../../apollo/client'
import { ZERO_ADDRESS } from '../../../constants'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'
import {
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  OmniBridgeList,
  SyncState,
} from '../EcoBridge.types'
import { EcoBridgeChildBase, getErrorMsg } from '../EcoBridge.utils'
import { ecoBridgeUIActions } from '../store/UI.reducer'
import { HOME_AMB_ABI } from './abis/abi'
import { BRIDGE_CONFIG, defaultTokensUrl } from './OmniBridge.config'
import { omniBridgeActions } from './OmniBridge.reducers'
import { omniBridgeSelectors } from './OmniBridge.selectors'
import {
  Mode,
  OmnibridgePairTokens,
  OmnibridgeSubgraphExecutions,
  OmnibridgeSubgraphRequests,
  OmnibridgeSubgraphResponse,
} from './OmniBridge.types'
import {
  approveToken,
  calculateFees,
  checkRewardAddress,
  combineTransactions,
  executeSignatures,
  fetchAllowance,
  fetchAmbVersion,
  fetchConfirmations,
  fetchMode,
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  getGraphEndpoint,
  getMediatorAddress,
  getMessage,
  getMessageData,
  messageCallStatus,
  QUERY_ETH_PRICE,
  relayTokens,
  requiredSignatures,
  timeout,
} from './OmniBridge.utils'
import { executionsQuery, partnerTxHashQuery, requestsUserQuery } from './subgraph/history'
import { foreignTokensQuery, homeTokensQuery } from './subgraph/tokens'
export class OmniBridge extends EcoBridgeChildBase {
  private _homeChainId: ChainId
  private _foreignChainId: ChainId
  private _listeners: NodeJS.Timeout[] = []
  private _tokensPair: OmnibridgePairTokens | undefined
  private _currentDay: BigNumber | undefined
  private _homeAmbContract: Contract | undefined

  private get store() {
    if (!this._store) throw new Error('OmniBridge: No store set')
    return this._store
  }

  private get actions() {
    return omniBridgeActions[this.bridgeId as OmniBridgeList]
  }
  private get selectors() {
    return omniBridgeSelectors[this.bridgeId as OmniBridgeList]
  }

  constructor({ supportedChains: supportedChainsArr, bridgeId, displayName }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName })

    if (supportedChainsArr.length !== 1) throw new Error('Invalid config')

    const [supportedChains] = supportedChainsArr
    const { from, to } = supportedChains

    this._homeChainId = from
    this._foreignChainId = to
  }
  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    this._homeAmbContract = new Contract(
      BRIDGE_CONFIG[this.bridgeId].homeAmbAddress,
      HOME_AMB_ABI,
      this._staticProviders?.[this._homeChainId]
    )

    await this._fetchHistory()
    this.startListeners()
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.pendingTxListener, 5000))
  }

  public onSignerChange = async (signerData: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public triggerBridging = async () => {
    try {
      if (!this._account || !this._activeProvider || !this._tokensPair) return

      const { fromToken, toToken } = this._tokensPair
      const {
        address: fromTokenAddress,
        mode: fromTokenMode,
        mediator: fromMediator,
        amount: fromAmount,
        chainId: fromChainId,
        decimals: fromTokenDecimals,
      } = fromToken

      const {
        chainId: toChainId,
        address: toTokenAddress,
        mode: toTokenMode,
        amount: toTokenAmount,
        decimals: toTokenDecimals,
      } = toToken

      if (!fromTokenMode || !fromMediator || !toTokenMode) return

      let shouldReceiveNativeCurrency = false

      if (
        toChainId === BRIDGE_CONFIG[this.bridgeId].foreignChainId &&
        toTokenAddress === ZERO_ADDRESS &&
        toTokenMode === Mode.NATIVE
      ) {
        shouldReceiveNativeCurrency = true
      }

      const isHomeChainId = this._activeChainId === this._homeChainId
      const isClaimDisabled = BRIDGE_CONFIG[this.bridgeId].claimDisabled
      const tokensClaimDisabled = BRIDGE_CONFIG[this.bridgeId].tokensClaimDisabled

      //check is withdraw
      const needsClaiming =
        isHomeChainId && !isClaimDisabled && !(tokensClaimDisabled || []).includes(fromTokenAddress.toLowerCase())

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

      const tx = await relayTokens(
        this._activeProvider.getSigner(),
        { address: fromTokenAddress, mode: fromTokenMode, mediator: fromMediator },
        this._account,
        fromAmount.toString(),
        { shouldReceiveNativeCurrency, foreignChainId: this._foreignChainId }
      )

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

      this.store.dispatch(
        this.actions.addTransaction({
          assetName: fromToken.symbol ?? '',
          assetAddressL1: fromToken.address,
          assetAddressL2: toToken.address,
          fromChainId,
          toChainId,
          sender: this._account,
          txHash: tx.hash,
          fromValue: formatUnits(fromAmount.toString(), fromTokenDecimals),
          toValue: formatUnits(toTokenAmount.toString(), toTokenDecimals),
          needsClaiming,
          status: BridgeTransactionStatus.PENDING,
        })
      )

      const receipt = await tx.wait()

      if (receipt) {
        this.store.dispatch(this.actions.updateTransaction({ txHash: receipt.transactionHash, receipt }))
      }
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({
          status: BridgeModalStatus.ERROR,
          error: getErrorMsg(e, this.bridgeId),
        })
      )
    }
  }

  public approve = async () => {
    try {
      if (!this._account || !this._activeProvider || !this._tokensPair) throw new Error('Cannot execute approve method')

      const {
        fromToken: { address: fromTokenAddress, mediator: fromMediator, amount: fromAmount },
      } = this._tokensPair

      if (!fromMediator) throw new Error('Mediator not found')

      const tx = await approveToken(
        { address: fromTokenAddress, mediator: fromMediator },
        fromAmount.toString(),
        this._activeProvider.getSigner()
      )

      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Approving',
          isError: false,
          isLoading: true,
          isBalanceSufficient: true,
          isApproved: false,
        })
      )

      const receipt = await tx.wait()

      if (receipt) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Bridge',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: true,
          })
        )
      }
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({
          status: BridgeModalStatus.ERROR,
          error: getErrorMsg(e, this.bridgeId),
        })
      )
    }
  }

  public collect = async () => {
    try {
      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

      const collectableTxHash = this.store.getState().ecoBridge.ui.collectableTxHash
      const transactions = this.selectors.selectAllTransactions(this.store.getState())

      if (!collectableTxHash || !this._homeAmbContract) return

      const collectableTransaction = transactions.find(
        tx => tx.txHash.toLowerCase() === collectableTxHash.toLowerCase()
      )

      if (!this._staticProviders) return

      const homeAmbAddress = BRIDGE_CONFIG[this.bridgeId].homeAmbAddress
      const foreignAmbAddress = BRIDGE_CONFIG[this.bridgeId].foreignAmbAddress

      const homeProvider = this._staticProviders[this._homeChainId]
      const foreignProvider = this._staticProviders[this._foreignChainId]

      if (!foreignProvider || !homeProvider || !collectableTransaction) return

      const { message, txHash } = collectableTransaction

      const homeRequiredSignatures = await requiredSignatures(homeAmbAddress, homeProvider)
      let txMessage =
        message && message.signatures && message.signatures.length >= homeRequiredSignatures ? message : null

      if (!txMessage) {
        const fetchedMessage = await getMessage(true, txHash, homeProvider, this._homeAmbContract)
        txMessage = fetchedMessage
      }
      const isClaimed = await messageCallStatus(foreignAmbAddress, txMessage.messageId, foreignProvider)

      if (isClaimed) {
        this.store.dispatch(
          ecoBridgeUIActions.setBridgeModalStatus({
            status: BridgeModalStatus.ERROR,
            error: 'Tokens already claimed',
          })
        )
        return
      }

      const { signatures, messageData } = txMessage

      if (!signatures || !messageData || !this._activeProvider) return

      const foreignAmbVersion = await fetchAmbVersion(foreignAmbAddress, foreignProvider)

      const tx = await executeSignatures(
        foreignAmbAddress,
        foreignAmbVersion,
        {
          messageData,
          signatures,
        },
        this._activeProvider.getSigner()
      )

      this.store.dispatch(this.actions.updatePartnerTransaction({ txHash, status: BridgeTransactionStatus.PENDING }))

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.COLLECTING }))

      const receipt = await tx.wait()

      if (receipt) {
        this.store.dispatch(
          this.actions.updatePartnerTransaction({ txHash, partnerTxHash: receipt.transactionHash, status: true })
        )
        this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.SUCCESS }))
      }
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({
          status: BridgeModalStatus.ERROR,
          error: getErrorMsg(e, this.bridgeId),
        })
      )
    }
  }

  public validate = async () => {
    try {
      if (!this._tokensPair || !this._staticProviders || !this._account || !this._currentDay) return

      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Loading',
          isError: false,
          isLoading: true,
          isBalanceSufficient: false,
          isApproved: false,
        })
      )

      const { fromToken, toToken } = this._tokensPair

      const limits = await fetchTokenLimits(this.bridgeId, fromToken, toToken, this._currentDay, this._staticProviders)

      if (!limits) throw new Error('Cannot get limits')

      const { maxPerTx, minPerTx } = limits

      const { amount: fromAmount, mode: fromTokenMode, address: fromTokenAddress, mediator: fromMediator } = fromToken

      if (fromAmount.lt(minPerTx)) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: `Specify more than ${minPerTx.toString()}`,
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return
      }

      if (fromAmount.gt(maxPerTx)) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: `Specify less than ${maxPerTx.toString()}`,
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return
      }

      const allowance = await fetchAllowance(
        { address: fromTokenAddress, mediator: fromMediator },
        this._account,
        this._staticProviders[fromToken.chainId]
      )

      if (!allowance || !fromTokenMode) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Cannot fetch allowance. Try later',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return
      }

      if ([Mode.NATIVE, Mode.ERC677].includes(fromTokenMode) || allowance.gte(fromAmount)) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Bridge',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: true,
          })
        )
      } else {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Approve',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: false,
          })
        )
      }
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Cannot execute validate',
          isError: false,
          isLoading: false,
          isBalanceSufficient: true,
          isApproved: false,
        })
      )
    }
  }

  public fetchDynamicLists = async () => {
    try {
      if (!this._activeChainId) return

      const { from, to } = this.store.getState().ecoBridge.ui

      const selectedChains = [from.chainId, to.chainId]

      if (!(selectedChains.includes(this._foreignChainId) && selectedChains.includes(this._homeChainId))) {
        this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
        return
      }

      this.store.dispatch(this.actions.setTokenListsStatus(SyncState.LOADING))

      const homeEndpoint = getGraphEndpoint(from.chainId, this.bridgeId)
      const foreignEndpoint = getGraphEndpoint(to.chainId, this.bridgeId)

      const fetchDefaultTokens = async () => {
        const url = defaultTokensUrl[Number(from.chainId)]

        const ajv = new Ajv({ allErrors: false })
        addFormats(ajv)

        const tokenListValidator = ajv.compile(schema)

        const response = await fetch(url)
        if (response.ok) {
          const json: TokenList = await response.json()
          if (tokenListValidator(json)) {
            return json.tokens.filter(token => token.chainId === from.chainId)
          }
        }
        return []
      }

      const [homeData, foreignData, defaultTokens] = await Promise.all([
        request<OmnibridgeSubgraphResponse>(homeEndpoint, homeTokensQuery),
        request<OmnibridgeSubgraphResponse>(foreignEndpoint, foreignTokensQuery),
        fetchDefaultTokens(),
      ])

      const allTokens = homeData.tokens.concat(foreignData.tokens, defaultTokens)

      const uniqueTokens = () => {
        const seen: { [address: string]: boolean } = {}
        return allTokens.reverse().filter(token => {
          const { address } = token
          const lowerCaseAddress = address.toLowerCase()
          const isDuplicate = Object.prototype.hasOwnProperty.call(seen, lowerCaseAddress)
            ? false
            : (seen[lowerCaseAddress] = true)
          return isDuplicate
        })
      }

      const tokens = uniqueTokens()

      const tokenList: TokenList = {
        name: 'OmniBridge',
        timestamp: new Date().toISOString(),
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        tokens,
      }

      this.store.dispatch(this.actions.addTokenLists({ [this.bridgeId]: tokenList }))
      this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
    } catch (e) {
      this.store.dispatch(this.actions.setTokenListsStatus(SyncState.FAILED))
    }
  }

  public fetchStaticLists = async () => undefined

  public getBridgingMetadata = async () => {
    if (!this._activeProvider || !this._activeChainId || !this._staticProviders || !this._account) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const {
      address: fromTokenAddressUI,
      chainId: fromChainId,
      name: fromTokenName,
      value: fromAmount,
      decimals: fromTokenDecimals,
      symbol: fromTokenSymbol,
    } = this.store.getState().ecoBridge.ui.from

    if (Number(fromAmount) === 0) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.IDLE }))
      return
    }

    const requestId = this.store.getState().ecoBridge[this.bridgeId as OmniBridgeList].lastMetadataCt

    const helperRequestId = (requestId ?? 0) + 1

    this.store.dispatch(this.actions.requestStarted({ id: helperRequestId }))

    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

    if (fromTokenAddressUI === Currency.getNative(this._homeChainId).symbol) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const fromTokenAddress =
      fromTokenAddressUI === Currency.getNative(this._foreignChainId).symbol ? ZERO_ADDRESS : fromTokenAddressUI

    const fromTokenMode =
      fromTokenAddress === ZERO_ADDRESS
        ? Mode.NATIVE
        : await fetchMode(
            this.bridgeId,
            { address: fromTokenAddress, chainId: fromChainId },
            this._staticProviders[fromChainId]
          )

    const fromTokenMediator = getMediatorAddress(this.bridgeId, { address: fromTokenAddress, chainId: fromChainId })

    if (!fromTokenMediator || !fromTokenMode || !fromTokenName) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const toToken = await fetchToToken(
      this.bridgeId,
      { address: fromTokenAddress, chainId: fromChainId, mode: fromTokenMode, name: fromTokenName },
      this._activeChainId === this._homeChainId ? this._foreignChainId : this._homeChainId,
      this._staticProviders
    )

    if (!toToken) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const {
      address: toTokenAddress,
      chainId: toChainId,
      decimals: toTokenDecimals,
      mediator: toMediator,
      mode: toTokenMode,
      name: toTokenName,
    } = toToken

    let parsedFromAmount = BigNumber.from(0)
    try {
      parsedFromAmount = parseUnits(fromAmount, fromTokenDecimals)
    } catch (e) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const feesData = await calculateFees(this.bridgeId, this._staticProviders[this._homeChainId])

    if (!feesData) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const { feeManagerAddress, foreignToHomeFee, homeToForeignFee, currentDay } = feesData

    this._currentDay = currentDay

    const isAddressReward = await checkRewardAddress(
      feeManagerAddress,
      this._account,
      this._staticProviders[this._homeChainId]
    )

    const feeType = this._activeChainId === this._homeChainId ? homeToForeignFee : foreignToHomeFee

    const toAmount = isAddressReward
      ? parsedFromAmount
      : await fetchToAmount(
          this.bridgeId,
          feeType,
          { address: fromTokenAddress, chainId: fromChainId, name: fromTokenName, mediator: fromTokenMediator },
          {
            address: toTokenAddress,
            chainId: toChainId,
            name: toTokenName,
            mediator: toMediator ?? '',
          },
          parsedFromAmount,
          feeManagerAddress,
          this._staticProviders[this._homeChainId]
        )

    const feeAmount = parsedFromAmount.sub(toAmount)

    let fee = '0%'

    if (feeAmount.gt(0)) {
      fee = `${(
        (Number(formatUnits(feeAmount.toString(), toTokenDecimals)) /
          Number(formatUnits(parsedFromAmount.toString(), fromTokenDecimals))) *
        100
      ).toFixed(2)}%`
    }

    this._tokensPair = {
      fromToken: {
        address: fromTokenAddress,
        chainId: fromChainId,
        name: fromTokenName,
        mode: fromTokenMode,
        mediator: fromTokenMediator,
        decimals: fromTokenDecimals ?? 0,
        amount: parsedFromAmount,
        symbol: fromTokenSymbol,
      },
      toToken: {
        address: toTokenAddress,
        chainId: toChainId,
        name: toTokenName,
        decimals: toTokenDecimals,
        mode: toTokenMode,
        mediator: toMediator,
        amount: toAmount,
        symbol: toTokenName,
      },
    }

    let gas: undefined | string = undefined

    try {
      const GAS_COST = 260000

      const gasPrice = await this._staticProviders[this._activeChainId]?.getGasPrice()

      if (!gasPrice) throw new Error('Cannot get gas price')

      const {
        bundle: { nativeCurrencyPrice },
      } = await request(subgraphClientsUris[this._activeChainId as SWPRSupportedChains], QUERY_ETH_PRICE)

      const gasCostInNativeCurrency = formatEther(gasPrice.mul(GAS_COST))

      gas = `${(Number(gasCostInNativeCurrency) * Number(nativeCurrencyPrice)).toFixed(2)}$`
    } catch (e) {
      gas = undefined
    }

    const details = {
      fee,
      gas,
      receiveAmount: Number(formatUnits(toAmount.toString(), toTokenDecimals)).toFixed(2),
      estimateTime: '5 min',
      requestId: helperRequestId,
    }
    this.store.dispatch(this.actions.setBridgeDetails(details))
  }

  private _fetchHistory = async () => {
    try {
      if (!this._account || !this._activeChainId) return

      const [{ requests: homeRequests }, { requests: foreignRequests }] = await Promise.all<OmnibridgeSubgraphRequests>(
        [
          request(getGraphEndpoint(this._homeChainId, this.bridgeId), requestsUserQuery, {
            user: this._account,
          }),
          request(getGraphEndpoint(this._foreignChainId, this.bridgeId), requestsUserQuery, {
            user: this._account,
          }),
        ]
      )

      const homeRequestsIds = homeRequests.map(request => request.messageId)
      const foreignRequestsIds = foreignRequests.map(request => request.messageId)

      const [{ executions: homeExecutions }, { executions: foreignExecutions }] =
        await Promise.all<OmnibridgeSubgraphExecutions>([
          request(getGraphEndpoint(this._homeChainId, this.bridgeId), executionsQuery, {
            messageIds: foreignRequestsIds,
          }),
          request(getGraphEndpoint(this._foreignChainId, this.bridgeId), executionsQuery, {
            messageIds: homeRequestsIds,
          }),
        ])

      const homeTransfers = combineTransactions(
        homeRequests,
        foreignExecutions,
        this._homeChainId,
        this._foreignChainId
      )

      const foreignTransfers = combineTransactions(
        foreignRequests,
        homeExecutions,
        this._foreignChainId,
        this._homeChainId
      )

      this.store.dispatch(this.actions.addTransactions([...homeTransfers, ...foreignTransfers]))
    } catch (e) {
      console.warn('Cannot fetch history')
    }
  }

  private pendingTxListener = async () => {
    try {
      if (!this._account || !this._staticProviders) return
      const pendingTxs = this.selectors.selectPendingTransactions(this.store.getState(), this._account)

      if (!pendingTxs.length || !this._homeAmbContract) return

      for (const pendingTx of pendingTxs) {
        if (!this._staticProviders) return

        const { fromChainId, txHash, needsClaiming, toChainId } = pendingTx

        const tx = await this._staticProviders[fromChainId]?.getTransaction(txHash)

        const receipt = tx ? await timeout(25000, tx.wait()) : null

        const ambAddress =
          fromChainId === this._homeChainId
            ? BRIDGE_CONFIG[this.bridgeId].homeAmbAddress
            : BRIDGE_CONFIG[this.bridgeId].foreignAmbAddress

        const provider =
          fromChainId === this._homeChainId
            ? this._staticProviders[this._homeChainId]
            : this._staticProviders[this._foreignChainId]

        if (!provider) return
        const confirmations = receipt ? receipt.confirmations : 0
        const totalConfirms = await fetchConfirmations(ambAddress, provider)

        const isHomeChainId = fromChainId === this._homeChainId

        if (receipt) {
          if (confirmations >= totalConfirms) {
            if (needsClaiming) {
              try {
                const message = await getMessage(isHomeChainId, txHash, provider, this._homeAmbContract)

                if (message && message.signatures) {
                  this.store.dispatch(this.actions.updatePartnerTransaction({ txHash, message, status: true }))
                }
              } catch (e) {
                return
              }
            } else {
              const toProvider = this._staticProviders[toChainId]
              const toAmbAddress = BRIDGE_CONFIG[this.bridgeId].homeAmbAddress
              if (!toProvider) return
              const { messageId } = await getMessageData(isHomeChainId, provider, txHash, receipt)

              const status = await messageCallStatus(toAmbAddress, messageId, toProvider)

              if (status) {
                const data = await request<{ executions: { txHash: string }[] }>(
                  getGraphEndpoint(toChainId, this.bridgeId),
                  partnerTxHashQuery,
                  {
                    messageId,
                  }
                )

                if (data && data.executions.length) {
                  const [partnerTransaction] = data.executions
                  if (!partnerTransaction) return

                  this.store.dispatch(
                    this.actions.updatePartnerTransaction({
                      txHash,
                      partnerTxHash: partnerTransaction.txHash,
                      status: true,
                    })
                  )
                }
              }
            }
          }
        }
      }
    } catch (e) {
      return
    }
  }
}
