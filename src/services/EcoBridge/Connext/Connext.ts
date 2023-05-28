import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'

import ERC20 from '@connext/contracts/artifacts/IERC20.json'
import { getDeployedConnextContract } from '@connext/nxtp-txservice'
import { getHardcodedGasLimits } from '@connext/nxtp-utils'
import { SdkShared, create } from '@connext/sdk'
import { TokenInfo } from '@uniswap/token-lists'

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
import {
  ConnextQuote,
  ConnextSDK,
  ConnextTransaction,
  ConnextTransactionsSubgraph,
  ConnextTransactionStatus,
} from './Connext.types'
import { SilentLogger, getReceivingTransaction, getTransactionsQuery } from './Connext.utils'

export class Connext extends EcoBridgeChildBase {
  private sdk: ConnextSDK | undefined

  private _quote: ConnextQuote | undefined

  private get actions() {
    return connextActions[this.bridgeId as ConnextIdList]
  }

  private get selectors() {
    return connextSelectors[this.bridgeId as ConnextIdList]
  }

  constructor({
    supportedChains: supportedChainsArr,
    bridgeId,
    displayName = 'Connext',
    displayUrl,
  }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName, displayUrl })
    this.setBaseActions(this.actions)
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    if (!this._activeProvider) return

    await this._createConnextSdk(this._activeProvider.getSigner())

    // TODO: fetch history
    // await this.fetchHistory()

    this.ecoBridgeUtils.listeners.start([{ listener: this.pendingTransactionsListener }])
  }

  public onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    //update sdk config with new signer
    const signerAddress = signerData.activeProvider.getSigner()

    if (this.sdk?.sdkBase) {
      await this.sdk.sdkBase.changeSignerAddress(signerAddress._address)
    }

    if (this.sdk?.sdkRouter) {
      await this.sdk.sdkRouter.changeSignerAddress(signerAddress._address)
    }

    if (this.sdk?.sdkPool) {
      await this.sdk.sdkPool.changeSignerAddress(signerAddress._address)
    }

    this.setSignerData(signerData)
  }

  private _createConnextSdk = async (signer: Signer) => {
    const silentLogger = new SilentLogger()

    try {
      const signerAddress = await signer.getAddress()
      const sdk = await create(
        {
          chains: connextSdkConfig,
          signerAddress: signerAddress,
        },
        silentLogger
      )

      if (sdk) {
        this.sdk = sdk
      }
    } catch (e) {
      throw this.ecoBridgeUtils.logger.error('Connext: Failed to create connext sdk')
    }
  }

  public approve = async () => {
    try {
      if (!this._activeProvider || !this.sdk) return

      const {
        from: { address, value, decimals, chainId },
      } = this.store.getState().ecoBridge.ui

      const signer = this._activeProvider?.getSigner()
      const amount = parseUnits(value, decimals)
      const erc20 = new Contract(address, ERC20.abi, signer)

      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVING)

      const managerContract = getDeployedConnextContract(chainId)
      if (!managerContract) return

      const approveTx = await erc20.approve(managerContract, amount)
      const receipt = await approveTx.wait()

      if (receipt) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  public collect = async () => {
    try {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

      const transactionHash = this.store.getState().ecoBridge.ui.collectableTxHash

      if (!transactionHash || !this._account || !this.sdk)
        throw this.ecoBridgeUtils.logger.error('Cannot execute collect method')

      const allTransactions = this.selectors.selectOwnedTransactions(this.store.getState(), this._account)

      const transaction = this.selectors.selectTransaction(this.store.getState(), transactionHash)

      if (!transaction) throw this.ecoBridgeUtils.logger.error('Cannot find transaction')

      const transactionToCollect = allTransactions.find(
        tx =>
          tx.transactionId === transaction.transactionId &&
          tx.chainId !== transaction.chainId &&
          tx.receivingChainId === transaction.receivingChainId
      )

      if (!transactionToCollect) throw this.ecoBridgeUtils.logger.error('Cannot find transaction to collect')

      const {
        encryptedCallData,
        encodedBid,
        bidSignature,
        amount,
        expiry,
        preparedBlockNumber,
        receivingChainTxManagerAddress,
        user,
        router,
        initiator,
        sendingAssetId,
        receivingAssetId,
        sendingChainFallback,
        callTo,
        receivingAddress,
        callDataHash,
        transactionId,
        sendingChainId,
        receivingChainId,
      } = transactionToCollect
      //@ts-expect-error
      const receipt = await this.sdk.fulfillTransfer(
        {
          txData: {
            amount,
            expiry: Number(expiry),
            preparedBlockNumber: Number(preparedBlockNumber),
            receivingChainTxManagerAddress,
            user: user.id,
            router: router.id,
            initiator,
            sendingAssetId,
            receivingAssetId,
            sendingChainFallback: sendingChainFallback ?? '',
            callTo,
            receivingAddress,
            sendingChainId: Number(sendingChainId),
            receivingChainId: Number(receivingChainId),
            callDataHash,
            transactionId,
          },
          encryptedCallData,
          encodedBid: encodedBid ?? '',
          bidSignature: bidSignature ?? '',
        },
        false
      )

      this.store.dispatch(this.actions.updateTransactionAfterCollect(transactionHash))
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.COLLECTING)

      if (receipt) {
        this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.SUCCESS)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  public fetchDynamicLists = async () => {
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

  public fetchStaticLists = async () => {
    this.store.dispatch(this.commonActions.activateLists([BRIDGES.CONNEXT.id]))
  }

  public triggerBridging = async () => {
    try {
      if (!this.sdk || !this._account || !this._quote) {
        throw this.ecoBridgeUtils.logger.error('Cannot trigger transaction')
      }

      const signer = this._activeProvider?.getSigner()

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

      const { from } = this.store.getState().ecoBridge.ui
      //TODO: get amount from quote
      const amount = '0' // get from quote;
      const walletAddress = this._account

      const bridgeRequest = await this.sdk.sdkBase.xcall({
        amount,
        asset: from.address,
        to: walletAddress,
        origin: '',
        destination: '',
      })

      console.warn('Value', bridgeRequest?.value?.toString())

      if (bridgeRequest && signer) {
        try {
          let gasLimit = await signer.estimateGas(bridgeRequest)

          if (gasLimit) {
            bridgeRequest.gasLimit = gasLimit
          }
        } catch (error) {}

        const bridgeCallResponse = await signer.sendTransaction(bridgeRequest)

        const { hash } = { ...bridgeCallResponse }

        const xcall_receipt = await signer.provider.waitForTransaction(hash)

        const { transactionHash, status } = { ...xcall_receipt }

        console.log(transactionHash, status)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  public getBridgingMetadata = async () => {
    try {
      const requestId = this.ecoBridgeUtils.metadataStatus.start()

      let {
        from: { chainId: fromChainId, address: fromTokenAddress, value, decimals },
        to: { chainId: toChainId },
      } = this.store.getState().ecoBridge.ui

      const isNative = fromTokenAddress === Currency.getNative(fromChainId).symbol

      let receiveLocal = false

      if (isNative) {
        if (fromChainId === ChainId.MAINNET && fromTokenAddress.toLowerCase() === 'eth' && Currency.ETHER.address) {
          fromTokenAddress = Currency.ETHER.address
        }
        //eth to weth
        if (
          fromChainId === ChainId.MAINNET ||
          fromChainId === ChainId.ARBITRUM_ONE ||
          fromChainId === ChainId.OPTIMISM_MAINNET
        ) {
          if (toChainId === ChainId.XDAI || toChainId === ChainId.POLYGON) receiveLocal = true
        }
        if (fromChainId === ChainId.XDAI) {
          if (
            toChainId === ChainId.MAINNET ||
            toChainId === ChainId.ARBITRUM_ONE ||
            toChainId === ChainId.POLYGON ||
            toChainId === ChainId.OPTIMISM_MAINNET
          )
            receiveLocal = true
        }
      }

      if (!this._account || !this.sdk) throw this.ecoBridgeUtils.logger.error('Not enough information to find quote')

      const originDomain = SdkShared.chainIdToDomain(fromChainId).toString()
      const destinationDomain = SdkShared.chainIdToDomain(toChainId).toString()
      const fromAmount = parseUnits(value, decimals).toBigInt().toString()

      const quote = await this.sdk.sdkBase.calculateAmountReceived(
        originDomain,
        destinationDomain,
        fromTokenAddress,
        fromAmount,
        receiveLocal,
        true
      )

      if (!quote) throw this.ecoBridgeUtils.logger.error('Cannot fetch quote')

      this._quote = quote

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
          fee: routerFee.toString(),
          estimateTime: '15 MIN',
          requestId,
          gas: gasInUSD,
        })
      )
    } catch (e) {
      debugger
      this.ecoBridgeUtils.metadataStatus.fail()
    }
  }

  public validate = async () => {
    try {
      if (!this._activeProvider || !this._account || !this._quote) return

      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.LOADING)

      const {
        from: { address: fromTokenAddress, chainId: fromChainId },
      } = this.store.getState().ecoBridge.ui

      if (fromTokenAddress === Currency.getNative(fromChainId).symbol) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
        return
      }

      const token = new Contract(fromTokenAddress, ERC20.abi, this._activeProvider.getSigner())
      // @ts-expect-error
      const managerContract = getDeployedTransactionManagerContract(fromChainId)

      if (!managerContract) throw this.ecoBridgeUtils.logger.error('Cannot get managerContractAddress')

      const allowance: BigNumber = await token.allowance(this._account, managerContract.address)

      const { amountReceived: amount } = this._quote

      if (allowance.gte(BigNumber.from(amount))) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      } else {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVE)
      }
    } catch {
      this.ecoBridgeUtils.ui.statusButton.setError()
    }
  }

  public fetchHistory = async () => {
    if (!this._account || !this.sdk) return

    const query = getTransactionsQuery(this._account)

    const connextSupportedChains = this.supportedChains.reduce<number[]>((supportedChains, chain) => {
      const { from, to } = chain
      supportedChains.push(Number(from))
      supportedChains.push(Number(to))

      return supportedChains
    }, [])

    const queryTransactionsPerChain = connextSupportedChains
      .filter((chain, index) => connextSupportedChains.indexOf(chain) === index)
      .map(chain => {
        //@ts-expect-error
        return this.sdk?.querySubgraph(chain, query)
      })

    try {
      const [...connextSubgraphTransactions]: ConnextTransactionsSubgraph[] = await Promise.all(
        queryTransactionsPerChain
      )

      const connextTransactions = connextSubgraphTransactions.reduce<ConnextTransaction[]>(
        (allTransactions, chainTransaction) => {
          chainTransaction.transactions.forEach(transaction => {
            allTransactions.push(transaction)
          })
          return allTransactions
        },
        []
      )

      const transactionsSupportedByChain = connextTransactions.filter(tx =>
        connextSupportedChains.includes(Number(tx.sendingChainId)) &&
        connextSupportedChains.includes(Number(tx.receivingChainId))
          ? tx
          : null
      )

      const pendingTransactionsInStore = this.selectors
        .selectAllTransactions(this.store.getState())
        .filter(({ status }) => status === ConnextTransactionStatus.PENDING)

      const filteredTxs = transactionsSupportedByChain.reduce<ConnextTransaction[]>((total, next) => {
        const index = pendingTransactionsInStore.findIndex(
          tx => tx.prepareTransactionHash.toLowerCase() === next.prepareTransactionHash.toLowerCase()
        )
        if (index === -1) total.push(next)

        return total
      }, [])

      this.store.dispatch(this.actions.addTransactions(filteredTxs))
    } catch (e) {
      this.ecoBridgeUtils.logger.log('Cannot fetch history')
    }
  }

  private _updateTransaction = (transactionOnChain: ConnextTransactionsSubgraph, fulfillPending?: boolean) => {
    if (transactionOnChain && !!transactionOnChain.transactions.length) {
      const [txn] = transactionOnChain.transactions

      //if transaction is fulfilling don't update status to prepared
      if (fulfillPending && txn.status === ConnextTransactionStatus.PREPARED) return

      this.store.dispatch(this.actions.addTransaction(txn))
    }
  }

  public pendingTransactionsListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTransactions(this.store.getState(), this._account)

    if (!pendingTransactions.length) return

    try {
      const promises = pendingTransactions.map(async tx => {
        const transaction = this.selectors.selectTransaction(this.store.getState(), tx.txHash)

        if (!transaction || !this.sdk) return

        const { sendingChainId, receivingChainId, transactionId, fulfillPending } = transaction

        const query = getReceivingTransaction(transactionId)

        const [transactionOnFirstChain, transactionOnSecondChain] = await Promise.all<ConnextTransactionsSubgraph>([
          //@ts-expect-error
          this.sdk.querySubgraph(Number(sendingChainId), query),
          //@ts-expect-error
          this.sdk.querySubgraph(Number(receivingChainId), query),
        ])

        this._updateTransaction(transactionOnFirstChain, fulfillPending)
        this._updateTransaction(transactionOnSecondChain, fulfillPending)
      })

      await Promise.all(promises)
    } catch (e) {
      this.ecoBridgeUtils.logger.log('Cannot fetch transaction')
    }
  }
}
