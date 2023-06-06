import { ChainId, Currency, Token } from '@swapr/sdk'

import { getHardcodedGasLimits } from '@connext/nxtp-utils'
import { SdkShared, create } from '@connext/sdk'
import { TokenInfo } from '@uniswap/token-lists'
import { BigNumber, Signer, utils } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { BRIDGES } from '../../../constants'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'
import { formatGasOrFees } from '../../../utils/formatNumber'
import {
  BridgeModalStatus,
  ConnextIdList,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
} from '../EcoBridge.types'
import { ButtonStatus, EcoBridgeChildBase, getNativeCurrencyPrice } from '../EcoBridge.utils'

import { connextSdkConfig } from './Connext.config'
import { CONNEXT_TOKENS } from './Connext.lists'
import { connextActions } from './Connext.reducer'
import { connextSelectors } from './Connext.selectors'
import { ConnextQuote, ConnextSDK } from './Connext.types'
import { getConnextContract } from './Connext.utils'

export class Connext extends EcoBridgeChildBase {
  #sdk: ConnextSDK | undefined
  #quote: ConnextQuote | undefined

  get #actions() {
    return connextActions[this.bridgeId as ConnextIdList]
  }

  get #selectors() {
    return connextSelectors[this.bridgeId as ConnextIdList]
  }

  #getContract() {
    const {
      from: { chainId: fromChainId, address, decimals, symbol },
    } = this.store.getState().ecoBridge.ui

    const token = decimals && utils.isAddress(address) ? new Token(fromChainId, address, decimals) : undefined

    const contract = getConnextContract(fromChainId, symbol ?? token?.symbol)

    return contract
  }

  constructor({
    supportedChains: supportedChainsArr,
    bridgeId,
    displayName = 'Connext',
    displayUrl,
  }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName, displayUrl })
    this.setBaseActions(this.#actions)
  }

  init = async ({ account, activeChainId, activeProvider, store, staticProviders }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    if (!this._activeProvider) return

    await this.#CreateConnextSdk(this._activeProvider.getSigner())
  }
  getBridgingMetadata = async () => {
    const requestId = this.ecoBridgeUtils.metadataStatus.start()

    const {
      from: { chainId: fromChainId, address: value, decimals },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui
    const fromTokenAddress = this.#getContract() ?? ''

    const supportedConfigs = await this.#sdk?.sdkBase.getSupported()
    const isConnextSupported = supportedConfigs
      ?.find(s => s.chainId === fromChainId)
      ?.assets.some(address => address.toLowerCase() === fromTokenAddress.toLowerCase())
    if (!isConnextSupported) {
      this.store.dispatch(this.baseActions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    if (this.#sdk && fromTokenAddress) {
      const originDomain = SdkShared.chainIdToDomain(fromChainId).toString()
      const destinationDomain = SdkShared.chainIdToDomain(toChainId).toString()
      const fromAmount = parseUnits(value, decimals).toBigInt().toString()

      const quote = await this.#sdk.sdkBase.calculateAmountReceived(
        originDomain,
        destinationDomain,
        fromTokenAddress,
        fromAmount
      )

      if (!quote) throw this.ecoBridgeUtils.logger.error('Cannot fetch quote')

      this.#quote = quote

      const { amountReceived, routerFee } = quote

      const { execute } = await getHardcodedGasLimits(originDomain.toString())

      const gasPrice = await this._activeProvider?.getGasPrice()

      let gasInUSD: string | undefined = undefined

      if (gasPrice && ![ChainId.POLYGON, ChainId.OPTIMISM_MAINNET].includes(fromChainId)) {
        const gasInGwei = BigNumber.from(gasPrice).mul(execute)
        const totalGas = formatUnits(gasInGwei)

        const nativeCurrencyPrice = await getNativeCurrencyPrice(this._activeChainId as SWPRSupportedChains)

        if (nativeCurrencyPrice !== 0) {
          gasInUSD = formatGasOrFees(Number(totalGas) * nativeCurrencyPrice)
        }
      }
      this.store.dispatch(
        this.baseActions.setBridgeDetails({
          receiveAmount: Number(formatUnits(amountReceived, decimals)).toFixed(this._receiveAmountDecimalPlaces),
          fee: `$${Number(formatUnits(routerFee)).toFixed(3)}`,
          estimateTime: '15 MIN',
          requestId,
          gas: gasInUSD,
        })
      )
    }
  }

  onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    //update sdk config with new signer
    const signerAddress = signerData.activeProvider.getSigner()

    if (this.#sdk?.sdkBase) {
      await this.#sdk.sdkBase.changeSignerAddress(signerAddress._address)
    }

    if (this.#sdk?.sdkRouter) {
      await this.#sdk.sdkRouter.changeSignerAddress(signerAddress._address)
    }

    if (this.#sdk?.sdkPool) {
      await this.#sdk.sdkPool.changeSignerAddress(signerAddress._address)
    }

    this.setSignerData(signerData)
  }

  approve = async () => {
    try {
      if (!this._activeProvider || !this.#sdk) return

      const {
        from: { value, decimals, chainId: fromChainId },
      } = this.store.getState().ecoBridge.ui

      const contract = this.#getContract()
      if (contract === undefined) {
        this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, "Can't find contract")
        return
      }
      const signer = this._activeProvider?.getSigner()
      const amount = parseUnits(value, decimals).toString()
      const originDomain = SdkShared.chainIdToDomain(fromChainId).toString()

      const approve_request = await this.#sdk.sdkBase.approveIfNeeded(originDomain, contract, amount)

      if (approve_request) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVING)
        const approve_response = await signer.sendTransaction(approve_request)

        const { hash } = approve_response

        const approve_receipt = await signer.provider.waitForTransaction(hash)

        const { status } = { ...approve_receipt }

        if (status) {
          this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
        } else {
          this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId)
        }
      } else {
        this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }
  collect = async () => {}
  fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui

    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.LOADING))

    const supportedTokens = CONNEXT_TOKENS.reduce<TokenInfo[]>((allTokens, token) => {
      if (
        token.is_staging ||
        (fromChainId === ChainId.XDAI && token.symbol === 'DAI') ||
        ((fromChainId === ChainId.ARBITRUM_ONE || fromChainId === ChainId.MAINNET) && token.symbol === 'WETH')
      ) {
        return allTokens
      }

      const fromToken = token.contracts[fromChainId]
      const toToken = token.contracts[toChainId]

      if (fromToken && toToken) {
        const { contract_address: fromTokenAddress, contract_decimals: fromTokenDecimals } = fromToken
        const { contract_address: toTokenAddress, contract_decimals: toTokenDecimals } = toToken

        const supportedFromToken: TokenInfo = {
          address: fromTokenAddress,
          decimals: fromTokenDecimals,
          chainId: fromChainId,
          symbol: token.symbol,
          name: token.name,
          logoURI: token.logoURI,
        }
        const supportedToToken: TokenInfo = {
          ...supportedFromToken,
          decimals: toTokenDecimals,
          address: toTokenAddress,
          chainId: toChainId,
        }

        allTokens.push(supportedFromToken, supportedToToken)
      }

      return allTokens
    }, [])

    this.store.dispatch(
      this.baseActions.addTokenLists({
        connext: {
          name: 'Connext',
          timestamp: new Date().toISOString(),
          version: {
            major: 1,
            minor: 0,
            patch: 0,
          },
          tokens: supportedTokens,
        },
      })
    )
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.READY))
  }
  fetchStaticLists = async () => {
    this.store.dispatch(this.commonActions.activateLists([BRIDGES.CONNEXT.id]))
  }
  validate = async () => {
    try {
      if (!this._activeProvider || !this._account || !this.#quote || !this.#sdk) return

      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.LOADING)

      const {
        from: { address: fromTokenAddress, chainId: fromChainId, decimals, value },
      } = this.store.getState().ecoBridge.ui

      if (fromTokenAddress === Currency.getNative(fromChainId).symbol) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
        return
      }

      const managerContract = this.#getContract()

      if (!managerContract) throw this.ecoBridgeUtils.logger.error('Cannot get managerContractAddress')
      const origin = SdkShared.chainIdToDomain(fromChainId).toString()
      const amount = parseUnits(value, decimals).toString()

      const response = await this.#sdk.sdkBase.approveIfNeeded(origin, managerContract, amount)
      const isApproveNeeded = !!response

      if (isApproveNeeded) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVE)
      } else {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch {
      this.ecoBridgeUtils.ui.statusButton.setError()
    }
  }
  // fetchHistory = async () => {}
  // publicTransactionListner = async () => {}
  triggerBridging = async () => {
    try {
      if (!this.#sdk || !this._account || !this.#quote) {
        throw this.ecoBridgeUtils.logger.error('Cannot trigger transaction')
      }

      const signer = this._activeProvider?.getSigner()

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

      const {
        from: { address, chainId, value, decimals },
        to: { chainId: destinationChainId },
      } = this.store.getState().ecoBridge.ui

      const amount = parseUnits(value, decimals).toString()
      const walletAddress = this._account
      const origin = SdkShared.chainIdToDomain(chainId).toString()
      const destination = SdkShared.chainIdToDomain(destinationChainId).toString()
      const relayerFee = await this.#sdk.sdkBase
        .estimateRelayerFee({
          originDomain: origin,
          destinationDomain: destination,
        })
        ?.toString()

      const bridgeRequest = await this.#sdk.sdkBase.xcall({
        amount,
        asset: address,
        to: walletAddress,
        origin,
        destination,
        relayerFee,
      })

      if (bridgeRequest && signer) {
        try {
          let gasLimit = await signer.estimateGas(bridgeRequest)

          if (gasLimit) {
            bridgeRequest.gasLimit = gasLimit
          }
        } catch (error) {}

        const bridgeCallResponse = await signer.sendTransaction(bridgeRequest)

        const { hash } = { ...bridgeCallResponse }

        const xcallReceipt = await signer.provider.waitForTransaction(hash)

        console.log('connext transaction', JSON.stringify(xcallReceipt, null, 2))

        this.store.dispatch(this.baseActions.addTransaction(xcallReceipt))
        this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  #CreateConnextSdk = async (signer: Signer) => {
    try {
      const connext = await create({
        chains: connextSdkConfig,
        signerAddress: await signer.getAddress(),
      })
      this.#sdk = connext
    } catch (e) {
      console.log("Couldn't create connext sdk", e)
    }
  }
}
