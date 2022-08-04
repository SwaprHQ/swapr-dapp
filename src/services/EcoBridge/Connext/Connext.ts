import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency, WETH } from '@swapr/sdk'

import ERC20 from '@connext/nxtp-contracts/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json'
import { getDeployedTransactionManagerContract, NxtpSdk } from '@connext/nxtp-sdk'
import { getHardcodedGasLimits } from '@connext/nxtp-utils'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { ethers, utils } from 'ethers'
import { request } from 'graphql-request'

import { subgraphClientsUris } from '../../../apollo/client'
import { DAI } from '../../../constants'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'
import {
  BridgeModalStatus,
  ConnextList,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
} from '../EcoBridge.types'
import { EcoBridgeChildBase, getErrorMsg } from '../EcoBridge.utils'
import { commonActions } from '../store/Common.reducer'
import { ecoBridgeUIActions } from '../store/UI.reducer'
import { connextSdkChainConfig } from './Connext.config'
import { CONNEXT_TOKENS } from './Connext.lists'
import { connextActions } from './Connext.reducer'
import { connextSelectors } from './Connext.selectors'
import {
  ConnextQuote,
  ConnextTransaction,
  ConnextTransactionsSubgraph,
  ConnextTransactionStatus,
} from './Connext.types'
import { getReceivingTransaction, getTransactionsQuery, QUERY_NATIVE_PRICE } from './Connext.utils'

export class Connext extends EcoBridgeChildBase {
  private _connextSdk: NxtpSdk | undefined
  private _quote: ConnextQuote | undefined
  private _listeners: NodeJS.Timeout[] = []

  private get store() {
    if (!this._store) throw new Error('Connext: No store set')
    return this._store
  }

  private get actions() {
    return connextActions[this.bridgeId as ConnextList]
  }

  private get selectors() {
    return connextSelectors[this.bridgeId as ConnextList]
  }

  constructor({
    supportedChains: supportedChainsArr,
    bridgeId,
    displayName = 'Connext',
  }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName })
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    if (!this._activeProvider) return

    await this._createConnextSdk(this._activeProvider.getSigner())

    await this.fetchHistory()
    this.startListeners()
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.pendingTransactionsListener, 5000))
  }

  public onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    //update sdk config with new signer
    await this._createConnextSdk(signerData.activeProvider.getSigner())
    this.setSignerData(signerData)
  }

  private _createConnextSdk = async (signer: Signer) => {
    try {
      const connextSdk = await NxtpSdk.create({
        chainConfig: connextSdkChainConfig,
        signer,
        skipPolling: false,
      })

      if (connextSdk) {
        this._connextSdk = connextSdk
      }
    } catch (e) {
      throw new Error('Connext: Failed to create connext sdk')
    }
  }

  public approve = async () => {
    if (!this._activeProvider) return

    const {
      from: { address, value, decimals, chainId },
    } = this.store.getState().ecoBridge.ui

    try {
      const token = new Contract(address, ERC20.abi, this._activeProvider.getSigner())

      const amount = parseUnits(value, decimals)

      const managerContract = getDeployedTransactionManagerContract(chainId)

      if (!managerContract) return

      const transaction: ContractTransaction = await token.approve(managerContract.address, amount.toString())

      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Approving',
          isError: false,
          isLoading: true,
          isBalanceSufficient: true,
          isApproved: false,
        })
      )

      const receipt = await transaction.wait()

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
    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const transactionHash = this.store.getState().ecoBridge.ui.collectableTxHash

    try {
      if (!transactionHash || !this._account || !this._connextSdk) throw new Error('Cannot execute collect method')

      const allTransactions = this.selectors.selectOwnedTransactions(this.store.getState(), this._account)

      const transaction = this.selectors.selectTransaction(this.store.getState(), transactionHash)

      if (!transaction) throw new Error('Cannot find transaction')

      const transactionToCollect = allTransactions.find(
        tx =>
          tx.transactionId === transaction.transactionId &&
          tx.chainId !== transaction.chainId &&
          tx.receivingChainId === transaction.receivingChainId
      )

      if (!transactionToCollect) throw new Error('Cannot find transaction to collect')

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

      const receipt = await this._connextSdk.fulfillTransfer(
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
      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.COLLECTING }))

      if (receipt) {
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

  public fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui

    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.LOADING))

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

    const tokenList: TokenList = {
      name: 'Connext',
      timestamp: new Date().toISOString(),
      version: {
        major: 1,
        minor: 0,
        patch: 0,
      },
      tokens: supportedTokens,
    }

    this.store.dispatch(this.actions.addTokenLists({ connext: tokenList }))
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
  }

  public fetchStaticLists = async () => {
    this.store.dispatch(commonActions.activateLists(['connext']))
  }

  public triggerBridging = async () => {
    try {
      if (!this._connextSdk || !this._account || !this._quote) throw new Error('Cannot trigger transaction')

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

      const { from, to } = this.store.getState().ecoBridge.ui
      const { bid, gasFeeInReceivingToken, bidSignature } = this._quote

      const transferData = {
        bid,
        gasFeeInReceivingToken,
        bidSignature,
      }
      const {
        amount,
        callDataHash,
        callTo,
        expiry,
        receivingAssetId,
        receivingAddress,
        encryptedCallData,
        initiator,
        receivingChainTxManagerAddress,
        user,
        sendingAssetId,
        router,
      } = bid

      const { prepareResponse, transactionId } = await this._connextSdk.prepareTransfer(transferData, false)

      const summary: ConnextTransaction = {
        amount,
        bidSignature,
        callDataHash,
        chainId: from.chainId.toString(),
        callTo,
        expiry: expiry.toString(),
        receivingAddress,
        receivingAssetId,
        receivingChainId: to.chainId.toString(),
        encryptedCallData,
        initiator,
        prepareCaller: this._account,
        prepareTransactionHash: prepareResponse.hash,
        preparedBlockNumber: prepareResponse.blockNumber?.toString() ?? '0',
        preparedTimestamp: prepareResponse.timestamp?.toString() ?? '0',
        receivingChainTxManagerAddress,
        router: { id: router },
        sendingAssetId,
        sendingChainId: from.chainId.toString(),
        status: ConnextTransactionStatus.PREPARED,
        transactionId,
        user: { id: user },
        callData: null,
        cancelCaller: null,
        cancelMeta: null,
        cancelTimestamp: null,
        cancelTransactionHash: null,
        encodedBid: undefined,
        fulfillTransactionHash: null,
        signature: null,
      }

      this.store.dispatch(this.actions.addTransaction(summary))
      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({
          status: BridgeModalStatus.ERROR,
          error: getErrorMsg(e, this.bridgeId),
        })
      )
    }
  }
  public getBridgingMetadata = async () => {
    try {
      const requestId = this.store.getState().ecoBridge[this.bridgeId as ConnextList].lastMetadataCt

      const helperRequestId = (requestId ?? 0) + 1

      this.store.dispatch(this.actions.requestStarted({ id: helperRequestId }))

      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

      const {
        from: { chainId: fromChainId, address: fromTokenAddress, value, decimals },
        to: { chainId: toChainId },
      } = this.store.getState().ecoBridge.ui

      let toTokenAddress: string | undefined = undefined

      const isNative = fromTokenAddress === Currency.getNative(fromChainId).symbol

      const normalizedFromTokenAddress = fromTokenAddress.toLowerCase()

      if (isNative) {
        //eth to weth
        if (fromChainId === ChainId.MAINNET || fromChainId === ChainId.ARBITRUM_ONE) {
          if (toChainId === ChainId.XDAI) toTokenAddress = WETH[ChainId.XDAI].address

          if (toChainId === ChainId.POLYGON) toTokenAddress = WETH[ChainId.POLYGON].address
        }
        if (fromChainId === ChainId.XDAI) {
          if (toChainId === ChainId.MAINNET) toTokenAddress = DAI[ChainId.MAINNET].address

          if (toChainId === ChainId.ARBITRUM_ONE) toTokenAddress = DAI[ChainId.ARBITRUM_ONE].address

          if (toChainId === ChainId.POLYGON) toTokenAddress = DAI[ChainId.POLYGON].address
        }
      } else {
        toTokenAddress = CONNEXT_TOKENS.reduce<string | undefined>((tokenAddressOnDestinationChain, token) => {
          //find from token on Connext's token list
          const fromToken = token.contracts[fromChainId]

          if (fromToken && fromToken.contract_address.toLowerCase() === normalizedFromTokenAddress) {
            const toToken = token.contracts[toChainId]
            tokenAddressOnDestinationChain = toToken?.contract_address
          }
          return tokenAddressOnDestinationChain
        }, undefined)
      }

      if (!toTokenAddress || !this._account || !this._connextSdk)
        throw new Error('Not enough information to find quote')

      const quote = await this._connextSdk.getTransferQuote({
        sendingChainId: fromChainId,
        sendingAssetId: isNative ? ethers.constants.AddressZero : fromTokenAddress,
        receivingChainId: toChainId,
        receivingAssetId: toTokenAddress,
        receivingAddress: this._account,
        amount: parseUnits(value, decimals).toString(),
        transactionId: utils.hexlify(utils.randomBytes(32)),
      })

      if (!quote) throw new Error('Cannot fetch quote')

      this._quote = quote

      const {
        bid: { amount, amountReceived },
      } = quote

      const fee = `${(
        ((Number(formatUnits(amount)) - Number(formatUnits(amountReceived))) / Number(formatUnits(amount))) *
        100
      ).toFixed(2)}%`

      const { prepare } = await getHardcodedGasLimits(fromChainId)

      const gasPrice = await this._activeProvider?.getGasPrice()

      let gasInUSD: string | undefined = undefined

      if (gasPrice && fromChainId !== ChainId.POLYGON) {
        const gasInGwei = BigNumber.from(gasPrice).mul(prepare)
        const totalGas = formatUnits(gasInGwei)

        const {
          bundle: { nativeCurrencyPrice },
        } = await request(subgraphClientsUris[fromChainId as SWPRSupportedChains], QUERY_NATIVE_PRICE, {
          chainId: fromChainId,
        })

        if (nativeCurrencyPrice) {
          gasInUSD = `${(Number(totalGas) * Number(nativeCurrencyPrice)).toFixed(2)}$`
        }
      }

      const details = {
        receiveAmount: Number(formatUnits(amountReceived, decimals)).toFixed(2),
        fee,
        estimateTime: '15 MIN',
        requestId: helperRequestId,
        gas: gasInUSD,
      }

      this.store.dispatch(this.actions.setBridgeDetails(details))
    } catch (e) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
    }
  }
  public validate = async () => {
    if (!this._activeProvider || !this._account || !this._quote) return

    this.store.dispatch(
      ecoBridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, isApproved: false })
    )

    const {
      from: { address: fromTokenAddress, chainId: fromChainId },
    } = this.store.getState().ecoBridge.ui

    if (fromTokenAddress === Currency.getNative(fromChainId).symbol) {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Bridge',
          isLoading: false,
          isError: false,
          isApproved: true,
          isBalanceSufficient: true,
        })
      )
      return
    }

    try {
      const token = new Contract(fromTokenAddress, ERC20.abi, this._activeProvider.getSigner())

      const managerContract = getDeployedTransactionManagerContract(fromChainId)

      if (!managerContract) throw new Error('Cannot get managerContractAddress')

      const allowance: BigNumber = await token.allowance(this._account, managerContract.address)

      const {
        bid: { amount },
      } = this._quote

      if (allowance.gte(BigNumber.from(amount))) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Bridge',
            isLoading: false,
            isError: false,
            isApproved: true,
            isBalanceSufficient: true,
          })
        )
      } else {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Approve',
            isLoading: false,
            isError: false,
            isApproved: false,
            isBalanceSufficient: true,
          })
        )
      }
    } catch (e) {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Something went wrong',
          isLoading: false,
          isError: true,
          isApproved: false,
          isBalanceSufficient: false,
        })
      )
    }
  }

  public fetchHistory = async () => {
    if (!this._account || !this._connextSdk) return

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
        return this._connextSdk?.querySubgraph(chain, query)
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
      console.warn('Cannot fetch history')
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

        if (!transaction || !this._connextSdk) return

        const { sendingChainId, receivingChainId, transactionId, fulfillPending } = transaction

        const query = getReceivingTransaction(transactionId)

        const [transactionOnFirstChain, transactionOnSecondChain] = await Promise.all<ConnextTransactionsSubgraph>([
          this._connextSdk.querySubgraph(Number(sendingChainId), query),
          this._connextSdk.querySubgraph(Number(receivingChainId), query),
        ])

        this._updateTransaction(transactionOnFirstChain, fulfillPending)
        this._updateTransaction(transactionOnSecondChain, fulfillPending)
      })

      await Promise.all(promises)
    } catch (e) {
      console.warn('Cannot fetch transaction')
    }
  }
}
