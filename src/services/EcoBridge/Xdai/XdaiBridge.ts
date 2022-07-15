import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'

import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { BigNumber } from 'ethers'
import { request } from 'graphql-request'

import { subgraphClientsUris } from '../../../apollo/client'
import { DAI, ZERO_ADDRESS } from '../../../constants'
import ERC20_ABI from '../../../constants/abis/erc20.json'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'
import { QUERY_ETH_PRICE } from '../Arbitrum/ArbitrumBridge.utils'
import {
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
  XdaiBridgeList,
} from '../EcoBridge.types'
import { EcoBridgeChildBase, getErrorMsg } from '../EcoBridge.utils'
import { ecoBridgeUIActions } from '../store/UI.reducer'
import {
  XDAI_BRIDGE_EXECUTIONS,
  XDAI_BRIDGE_FOREIGN_REQUEST,
  XDAI_BRIDGE_HOME_REQUEST,
  XDAI_MESSAGE,
} from './subgraph/history'
import { xdaiBridgeTransactionAdapter } from './XdaiBridge.adapter'
import { xdaiActions } from './XdaiBridge.reducer'
import { xdaiSelectors } from './XdaiBridge.selectors'
import { XdaiBridgeExecutions, XdaiBridgeRequests, XdaiMessage } from './XdaiBridge.types'
import {
  combineTransactions,
  ETHEREUM_BRIDGE_ADDRESS,
  packSignatures,
  signatureToVRS,
  XDAI_BRIDGE_ADDRESS,
  XDAI_BRIDGE_FOREIGN_SUBGRAPH_ENDPOINT,
  XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT,
} from './XdaiBridge.utils'

export class XdaiBridge extends EcoBridgeChildBase {
  private _homeChainId = ChainId.XDAI
  private _foreignChainId = ChainId.MAINNET
  private _listeners: NodeJS.Timeout[] = []
  private _daiTokenOnMainnet: Contract | undefined = undefined

  constructor({ supportedChains, bridgeId, displayName = 'xDai Bridge' }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })
  }

  private get store() {
    if (!this._store) throw new Error('xDai: No store set')
    return this._store
  }

  private get actions() {
    return xdaiActions[this.bridgeId as XdaiBridgeList]
  }

  private get selectors() {
    return xdaiSelectors[this.bridgeId as XdaiBridgeList]
  }

  private _createDaiTokenOnMainnet = () => {
    if (this._activeChainId === ChainId.MAINNET) {
      const daiTokenOnMainnet = new Contract(DAI[ChainId.MAINNET].address, ERC20_ABI, this._activeProvider?.getSigner())

      return daiTokenOnMainnet
    }

    return
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    this._daiTokenOnMainnet = this._createDaiTokenOnMainnet()
    await this.fetchHistory()
    this.startListeners()
  }

  public onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)

    this._daiTokenOnMainnet = this._createDaiTokenOnMainnet()
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.pendingTransactionsListener, 5000))
  }

  public fetchStaticLists = async () => undefined

  public fetchDynamicLists = async () => {
    const { chainId } = this.store.getState().ecoBridge.ui.from

    //create list only for mainnet
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.LOADING))

    if (chainId === ChainId.MAINNET) {
      const tokenList: TokenList = {
        name: 'xDai Bridge',
        timestamp: new Date().toISOString(),
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        tokens: [DAI[ChainId.MAINNET] as TokenInfo],
      }
      this.store.dispatch(this.actions.addTokenLists({ xdai: tokenList }))
    }
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
  }

  public getBridgingMetadata = async () => {
    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

    const requestId = this.store.getState().ecoBridge[this.bridgeId as XdaiBridgeList].lastMetadataCt

    const helperRequestId = (requestId ?? 0) + 1

    this.store.dispatch(this.actions.requestStarted({ id: helperRequestId }))

    const {
      from: { chainId: fromChainId, value, address: fromTokenAddress },
    } = this.store.getState().ecoBridge.ui

    if (
      (fromChainId === ChainId.MAINNET &&
        fromTokenAddress.toLowerCase() !== DAI[ChainId.MAINNET].address.toLowerCase()) ||
      (fromChainId === ChainId.XDAI && fromTokenAddress !== Currency.getNative(fromChainId).symbol)
    ) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const estimatedGas = 100000

    let gas: string | undefined = undefined
    try {
      const gasPrice = await this._activeProvider?.getGasPrice()

      const {
        bundle: { nativeCurrencyPrice },
      } = await request(subgraphClientsUris[this._activeChainId as SWPRSupportedChains], QUERY_ETH_PRICE)

      const gasCost = estimatedGas * Number(gasPrice?.toString())

      const formattedGasCost = formatUnits(gasCost, 18)

      gas = `${Number(Number(formattedGasCost) * Number(nativeCurrencyPrice)).toFixed(2)}$`
    } catch {}

    const details = {
      gas,
      fee: '0%',
      estimateTime: '5 min',
      receiveAmount: Number(value).toFixed(2),
      requestId: helperRequestId,
    }

    this.store.dispatch(this.actions.setBridgeDetails(details))
  }

  public validate = async () => {
    this.store.dispatch(
      ecoBridgeUIActions.setStatusButton({
        label: 'Loading',
        isError: false,
        isLoading: true,
        isBalanceSufficient: false,
        isApproved: false,
      })
    )

    const {
      from: { chainId: fromChainId, value: fromAmount, decimals: fromTokenDecimals },
    } = this.store.getState().ecoBridge.ui

    const fromAmountNumber = Number(fromAmount)

    if (
      fromAmountNumber > 9999999 ||
      (fromChainId === ChainId.MAINNET && fromAmountNumber < 0.005) ||
      (fromChainId === ChainId.XDAI && fromAmountNumber < 10)
    ) {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: `Amount is underflow or overflow`,
          isError: true,
          isLoading: false,
          isBalanceSufficient: false,
          isApproved: false,
        })
      )
      return
    }

    try {
      if (this._daiTokenOnMainnet) {
        const allowance: BigNumber = await this._daiTokenOnMainnet.allowance(this._account, ETHEREUM_BRIDGE_ADDRESS)

        const parsedValue = parseUnits(fromAmount, fromTokenDecimals)

        if (allowance.gte(parsedValue)) {
          this.store.dispatch(
            ecoBridgeUIActions.setStatusButton({
              label: 'Bridge',
              isError: false,
              isLoading: false,
              isBalanceSufficient: true,
              isApproved: true,
            })
          )
          return
        }

        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Approve',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: false,
          })
        )
      } else {
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
        ecoBridgeUIActions.setStatusButton({
          label: 'Something went wrong',
          isError: true,
          isLoading: false,
          isBalanceSufficient: false,
          isApproved: false,
        })
      )
    }
  }

  public approve = async () => {
    if (!this._daiTokenOnMainnet) return

    const { value, decimals } = this.store.getState().ecoBridge.ui.from

    try {
      const parsedValue = parseUnits(value, decimals)
      const txn: ContractTransaction = await this._daiTokenOnMainnet.approve(ETHEREUM_BRIDGE_ADDRESS, parsedValue)

      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Approving',
          isError: false,
          isLoading: true,
          isBalanceSufficient: true,
          isApproved: false,
        })
      )

      const receipt = await txn.wait()

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

  public triggerBridging = async () => {
    if (!this._activeProvider || !this._account) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const {
      from: { chainId: fromChainId, value: fromValue, decimals: fromTokenDecimals },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui

    const amount = parseUnits(fromValue, fromTokenDecimals)

    let transaction: TransactionResponse | undefined = undefined

    try {
      if (this._daiTokenOnMainnet) {
        transaction = await this._daiTokenOnMainnet.transferFrom(this._account, ETHEREUM_BRIDGE_ADDRESS, amount)
      } else {
        transaction = await this._activeProvider.getSigner().sendTransaction({
          to: XDAI_BRIDGE_ADDRESS,
          value: amount,
        })
      }

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

      if (transaction) {
        this.store.dispatch(
          this.actions.addTransaction({
            assetAddressL1: fromChainId === ChainId.MAINNET ? DAI[ChainId.MAINNET].address : ZERO_ADDRESS,
            assetAddressL2: toChainId === ChainId.MAINNET ? DAI[ChainId.MAINNET].address : ZERO_ADDRESS,
            assetName: fromChainId === ChainId.MAINNET ? 'DAI' : 'XDAI',
            fromChainId,
            toChainId,
            value: fromValue,
            sender: this._account,
            status: BridgeTransactionStatus.PENDING,
            txHash: transaction.hash,
            needsClaiming: fromChainId !== ChainId.MAINNET,
          })
        )
      }
    } catch (err) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({
          status: BridgeModalStatus.ERROR,
          error: getErrorMsg(err, this.bridgeId),
        })
      )
    }
  }

  public collect = async () => {
    const collectableTransactionHash = this.store.getState().ecoBridge.ui.collectableTxHash

    if (!this._activeProvider || !collectableTransactionHash) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const abi = ['function executeSignatures(bytes messageData, bytes signatures) external']

    const ambContract = new Contract(ETHEREUM_BRIDGE_ADDRESS, abi, this._activeProvider.getSigner())

    const collectableTransaction = xdaiBridgeTransactionAdapter
      .getSelectors()
      .selectById(
        this.store.getState().ecoBridge[this.bridgeId as XdaiBridgeList].transactions,
        collectableTransactionHash
      )

    if (collectableTransaction?.message) {
      const { content, signatures } = collectableTransaction.message

      if (content && !!signatures?.length) {
        const signs = packSignatures(signatures.map(signature => signatureToVRS(signature)))

        try {
          const transaction: TransactionResponse = await ambContract.executeSignatures(content, signs)

          this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.COLLECTING }))

          this.store.dispatch(this.actions.updateTransactionAfterCollect({ txHash: collectableTransactionHash }))

          const receipt = await transaction.wait()

          if (receipt) {
            this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.SUCCESS }))

            this.store.dispatch(
              this.actions.updatePartnerTxHash({
                txHash: collectableTransactionHash,
                partnerTxHash: receipt.transactionHash,
              })
            )

            this.store.dispatch(
              this.actions.updateTransactionStatus({
                txHash: collectableTransactionHash,
                status: BridgeTransactionStatus.CLAIMED,
              })
            )
          }
        } catch (err) {
          this.store.dispatch(
            ecoBridgeUIActions.setBridgeModalStatus({
              status: BridgeModalStatus.ERROR,
              error: getErrorMsg(err, this.bridgeId),
            })
          )
        }
      }
    }
  }

  public fetchHistory = async () => {
    try {
      const [homeRequests, foreignRequests] = await Promise.all<XdaiBridgeRequests>([
        request(XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT, XDAI_BRIDGE_HOME_REQUEST, {
          user: this._account,
        }),
        request(XDAI_BRIDGE_FOREIGN_SUBGRAPH_ENDPOINT, XDAI_BRIDGE_FOREIGN_REQUEST, {
          user: this._account,
        }),
      ])

      const homeRequestsIds = homeRequests.requests.map(request => request.transactionHash)

      const foreignRequestsIds = foreignRequests.requests.map(request => request.transactionHash)

      const [homeExecutions, foreignExecutions] = await Promise.all<XdaiBridgeExecutions>([
        request(XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT, XDAI_BRIDGE_EXECUTIONS, {
          transactionsHash: foreignRequestsIds,
        }),
        request(XDAI_BRIDGE_FOREIGN_SUBGRAPH_ENDPOINT, XDAI_BRIDGE_EXECUTIONS, {
          transactionsHash: homeRequestsIds,
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

      const allTransfers = [...homeTransfers, ...foreignTransfers]

      this.store.dispatch(this.actions.addTransactions(allTransfers))
    } catch {
      throw new Error('Cannot fetch transactions history')
    }
  }

  public pendingTransactionsListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTransactions(this.store.getState(), this._account)

    if (!pendingTransactions.length || !this._staticProviders) return

    try {
      for (const transaction of pendingTransactions) {
        const { txHash } = transaction

        if (transaction.needsClaiming) {
          // if transaction needs claiming query subgraph about signatures (if signatures exist set status to "REDEEM")
          const response = await request<{ request: XdaiMessage }>(XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT, XDAI_MESSAGE, {
            transactionHash: txHash,
          })
          if (response && response.request.message) {
            const { id, content, signatures } = response.request.message
            if (id && content && !!signatures?.length) {
              // update transaction message entity when response is received
              this.store.dispatch(
                this.actions.updateTransactionMessage({ txHash, message: { content, signatures, id } })
              )

              // update transaction status to "REDEEM"
              if (!transaction.isFulfilling) {
                this.store.dispatch(
                  this.actions.updateTransactionStatus({ txHash, status: BridgeTransactionStatus.REDEEM })
                )
              }
            }
          }
        } else {
          const response = await request<XdaiBridgeExecutions>(
            XDAI_BRIDGE_HOME_SUBGRAPH_ENDPOINT,
            XDAI_BRIDGE_EXECUTIONS,
            {
              transactionsHash: [txHash],
            }
          )

          if (response.executions && !!response.executions.length) {
            const [execution] = response.executions

            this.store.dispatch(this.actions.updatePartnerTxHash({ txHash, partnerTxHash: execution.id }))

            this.store.dispatch(
              this.actions.updateTransactionStatus({ txHash, status: BridgeTransactionStatus.CONFIRMED })
            )
          }
        }
      }
    } catch (e) {
      throw new Error('Cannot fetch pending transactions')
    }
  }
}
