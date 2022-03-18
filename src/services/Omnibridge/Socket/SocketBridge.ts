import { ChainId, Currency } from '@swapr/sdk'
import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  OmnibridgeChangeHandler,
  BridgeModalStatus
} from '../Omnibridge.types'
import { OmnibridgeChildBase } from '../Omnibridge.utils'
import { SocketList } from '../Omnibridge.types'
import { socketActions } from './Socket.reducer'
import { socketSelectors } from './Socket.selectors'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { BigNumber } from 'ethers'
import { QuoteAPI, ServerAPI, ApprovalsAPI, TokenListsAPI } from './api'
import {
  BridgeStatusResponseSourceTxStatusEnum,
  QuoteControllerGetQuoteSortEnum,
  TokenAsset,
  TokenPriceResponseDTO
} from './api/generated'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import SocketLogo from '../../../assets/images/socket-logo.png'
import { commonActions } from '../store/Common.reducer'
import { DAI_ARBITRUM_ADDRESS, DAI_ETHEREUM_ADDRESS, SOCKET_NATIVE_TOKEN_ADDRESS } from './Socket.types'
import { getBridgeFee, getBestRoute } from './Socket.utils'

const getErrorMsg = (error: any) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  return `Bridge failed: ${error.message}`
}
export class SocketBridge extends OmnibridgeChildBase {
  private _listeners: NodeJS.Timeout[] = []

  constructor({ supportedChains, bridgeId, displayName = 'Socket' }: OmnibridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })
  }

  private get store() {
    if (!this._store) throw new Error('Socket: No store set')
    return this._store
  }

  private get actions() {
    return socketActions[this.bridgeId as SocketList]
  }

  private get selectors() {
    return socketSelectors[this.bridgeId as SocketList]
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: OmnibridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    this.startListeners()
  }

  public onSignerChange = async ({ ...signerData }: OmnibridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public collect = () => undefined

  public triggerCollect = () => undefined

  public triggerBridging = async () => {
    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const { data, to: recipient } = this.selectors.selectTxBridgingData(this.store.getState())
    const { from, to } = this.store.getState().omnibridge.UI

    if (
      !data ||
      !recipient ||
      !this._account ||
      !from.address ||
      !from.chainId ||
      !from.value ||
      !from.address ||
      !from.symbol ||
      !to.chainId
    )
      return

    try {
      const tx = await this._activeProvider?.getSigner().sendTransaction({
        to: recipient,
        data
      })

      if (!tx) return

      this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

      this.store.dispatch(
        this.actions.addTx({
          sender: this._account,
          txHash: tx.hash,
          assetName: from.symbol,
          value: from.value,
          fromChainId: from.chainId,
          toChainId: to.chainId,
          bridgeId: this.bridgeId
        })
      )
    } catch (e) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(e) })
      )
    }
  }
  public approve = async () => {
    //get approval data from store
    const { allowanceTarget, amount, chainId, owner, tokenAddress } = this.selectors.selectApprovalData(
      this.store.getState()
    )
    //shouldn't happen
    if (!allowanceTarget || !amount || !chainId || !owner || !tokenAddress) return

    //build tx for approve
    try {
      const transaction = await ApprovalsAPI.approveControllerFetchApprovalsCalldata({
        chainID: chainId.toString(),
        owner,
        allowanceTarget,
        tokenAddress,
        amount
      })

      if (!transaction.success) return

      const txn = await this._activeProvider?.getSigner().sendTransaction({
        to: transaction.result.to,
        data: transaction.result.data
      })

      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({
          label: 'Approving',
          isError: false,
          isLoading: true,
          isBalanceSufficient: true,
          approved: false
        })
      )

      const receipt = await txn?.wait()
      if (receipt) {
        this.store.dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Bridge',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            approved: true
          })
        )
      }
    } catch (e) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(e) })
      )
    }

    return
  }

  public validate = async () => {
    const routeId = this.store.getState().omnibridge.common.activeRouteId
    const routes = this.selectors.selectRoutes(this.store.getState())

    //this shouldn't happen because validation on front not allowed to set bridge which status is "failed"
    if (!routeId || !routes) return

    //find route
    const selectedRoute = routes.find(route => route.routeId === routeId)

    if (!selectedRoute) return
    //build txn

    try {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, approved: false })
      )
      const transaction = await ServerAPI.appControllerGetSingleTx(
        {
          singleTxDTO: { route: selectedRoute }
        },
        { signal: this.renewAbortController('singleTx') }
      )

      if (!transaction.success) {
        this.store.dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Something went wrong',
            isLoading: false,
            isError: true,
            approved: false,
            isBalanceSufficient: false
          })
        )
        return
      }

      const {
        result: { txTarget, txData, approvalData }
      } = transaction

      //push txData to store
      this.store.dispatch(this.actions.setTxBridgingData({ to: txTarget, data: txData }))

      if (!approvalData) {
        //when approvalData === null user can bridge
        this.store.dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Bridge',
            isLoading: false,
            isError: false,
            approved: true,
            isBalanceSufficient: true
          })
        )
      } else {
        //check allowance

        const activeChainId = this.store.getState().omnibridge.UI.from.chainId

        if (!activeChainId || !this._account) return

        const allowance = await ApprovalsAPI.approveControllerFetchApprovals(
          {
            chainID: activeChainId.toString(),
            owner: this._account,
            allowanceTarget: approvalData.allowanceTarget.toString(),
            tokenAddress: approvalData.approvalTokenAddress.toString()
          },
          { signal: this.renewAbortController('allowance') }
        )

        const {
          result: { value },
          success
        } = allowance

        if (success) {
          if (BigNumber.from(value).lt(BigNumber.from(approvalData.minimumApprovalAmount))) {
            this.store.dispatch(
              this.actions.setApprovalData({
                chainId: activeChainId ? activeChainId : 1,
                allowanceTarget: approvalData.allowanceTarget,
                tokenAddress: approvalData.approvalTokenAddress,
                amount: approvalData.minimumApprovalAmount,
                owner: approvalData.owner
              })
            )

            this.store.dispatch(
              omnibridgeUIActions.setStatusButton({
                label: 'Approve',
                isLoading: false,
                isError: false,
                approved: false,
                isBalanceSufficient: true
              })
            )
            return
          }

          this.store.dispatch(
            omnibridgeUIActions.setStatusButton({
              label: 'Bridge',
              isLoading: false,
              isError: false,
              approved: true,
              isBalanceSufficient: true
            })
          )
        } else {
          this.store.dispatch(
            omnibridgeUIActions.setStatusButton({
              label: 'Something went wrong',
              isLoading: false,
              isError: true,
              approved: false,
              isBalanceSufficient: false
            })
          )
        }
      }
    } catch (e) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(e) })
      )
    }
  }

  public getBridgingMetadata = async () => {
    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'loading' }))

    const { from, to } = this.store.getState().omnibridge.UI

    if (!from.chainId || !to.chainId || !this._account || !from.address || Number(from.value) === 0) return

    const socketTokens = this.store.getState().omnibridge.socket.lists[this.bridgeId]

    let fromTokenAddress: string = SOCKET_NATIVE_TOKEN_ADDRESS
    let toTokenAddress: string = SOCKET_NATIVE_TOKEN_ADDRESS

    //FIX it will be removed when we implemented our Socket List
    if (from.address !== Currency.getNative(from.chainId).symbol) {
      //way to find from and toToken
      const fromToken = socketTokens.tokens.find(token => token.address.toLowerCase() === from.address.toLowerCase())
      if (!fromToken) {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
        )
        return
      }

      if (
        (from.address.toLowerCase() === DAI_ETHEREUM_ADDRESS || from.address.toLowerCase() === DAI_ARBITRUM_ADDRESS) &&
        to.chainId === ChainId.XDAI
      ) {
        toTokenAddress = SOCKET_NATIVE_TOKEN_ADDRESS
      } else {
        const toToken = socketTokens.tokens.find(
          token => token.symbol === fromToken.symbol && token.chainId === to.chainId
        )
        if (!toToken) {
          this.store.dispatch(
            this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
          )
          return
        }
        toTokenAddress = toToken.address
      }

      fromTokenAddress = from.address
    }

    //when user select "XDAI" we want to pair it to DAI
    if (from.chainId === ChainId.XDAI && from.symbol === Currency.getNative(from.chainId).symbol) {
      if (to.chainId === ChainId.MAINNET) {
        toTokenAddress = DAI_ETHEREUM_ADDRESS
      }

      if (to.chainId === ChainId.ARBITRUM_ONE) {
        toTokenAddress = DAI_ARBITRUM_ADDRESS
      }
    }

    //when fromChain === ETH or ARB ONE and selected token is DAI we want to select toToken as XDAI
    if (
      (from.address.toLowerCase() === DAI_ETHEREUM_ADDRESS || from.address.toLowerCase() === DAI_ARBITRUM_ADDRESS) &&
      from.chainId === ChainId.XDAI
    ) {
      toTokenAddress = SOCKET_NATIVE_TOKEN_ADDRESS
    }

    const value = parseUnits(from.value, from.decimals)

    const quote = await QuoteAPI.quoteControllerGetQuote(
      {
        fromChainId: from.chainId.toString(),
        fromTokenAddress,
        toTokenAddress,
        toChainId: to.chainId.toString(),
        fromAmount: value.toString(),
        userAddress: this._account,
        uniqueRoutesPerBridge: false,
        disableSwapping: false,
        sort: QuoteControllerGetQuoteSortEnum.Output,
        singleTxOnly: true
      },
      { signal: this.renewAbortController('quote') }
    )

    const { success, result } = quote
    const { routes, toAsset } = result

    if (!success || routes.length === 0) {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
      )
      return
    }

    this.store.dispatch(this.actions.setRoutes(routes))

    let tokenData: TokenPriceResponseDTO | undefined = undefined

    try {
      tokenData = await ServerAPI.appControllerGetTokenPrice({
        tokenAddress: toAsset.address,
        chainId: toAsset.chainId
      })
    } catch (e) {}

    const bestRoute = getBestRoute(routes, tokenData, toAsset.decimals)

    if (!bestRoute) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'failed' }))
      return
    }

    const { toAmount, serviceTime, totalGasFeesInUsd, routeId, userTxs, fromAmount } = bestRoute

    this.store.dispatch(commonActions.setActiveRouteId(routeId))

    const fee = getBridgeFee(userTxs, { amount: fromAmount, decimals: from.decimals })

    const details = {
      gas: `${totalGasFeesInUsd.toFixed(2).toString()}$`,
      fee,
      estimateTime: `${(serviceTime / 60).toFixed(0).toString()} min`,
      receiveAmount: Number(formatUnits(toAmount, toAsset.decimals))
        .toFixed(2)
        .toString()
    }

    this.store.dispatch(this.actions.setBridgeDetails(details))
    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'ready' }))
  }

  public fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId }
    } = this.store.getState().omnibridge.UI

    if (!fromChainId || !toChainId) return

    this.store.dispatch(this.actions.setTokenListsStatus('loading'))

    const payload = {
      fromChainId: fromChainId.toString(),
      toChainId: toChainId.toString()
    }

    const tokenListFromPromise = TokenListsAPI.tokenListControllerGetfromTokenList(payload, {
      signal: this.renewAbortController('tokenListFrom')
    })

    const tokenListToPromise = TokenListsAPI.tokenListControllerGetToTokenList(payload, {
      signal: this.renewAbortController('tokenListTo')
    })

    const [tokenListFrom, tokenListTo] = await Promise.all([tokenListFromPromise, tokenListToPromise])

    //TODO find better way
    //currently we are paring tokens by symbol (not better option to do it)
    const pairedTokens = tokenListFrom.result.reduce<TokenAsset[]>((total, fromToken) => {
      if (!fromToken.symbol) return total

      const toToken = tokenListTo.result.find(
        token =>
          token.symbol === fromToken.symbol &&
          fromToken.address.toLowerCase() !== SOCKET_NATIVE_TOKEN_ADDRESS.toLowerCase()
      )

      if (toToken && toToken.symbol) {
        total.push(fromToken)
        total.push(toToken)
      } else {
        return total
      }

      return total
    }, [])

    const tokens: TokenInfo[] = pairedTokens.reduce<TokenInfo[]>((total, token) => {
      const { address, chainId, symbol, decimals, icon, name } = token

      if (!name || !decimals || !name) return total

      total.push({
        name,
        symbol,
        address,
        decimals,
        chainId: Number(chainId),
        logoURI: icon
      })

      return total
    }, [])

    const tokenList: TokenList = {
      name: 'Socket',
      timestamp: new Date().toISOString(),
      version: {
        major: 1,
        minor: 0,
        patch: 0
      },
      tokens,
      logoURI: SocketLogo
    }

    this.store.dispatch(this.actions.addTokenLists({ socket: tokenList }))
    this.store.dispatch(this.actions.setTokenListsStatus('ready'))
  }

  public fetchStaticLists = async () => {
    this.store.dispatch(commonActions.activateLists(['socket']))
  }

  public triggerModalDisclaimerText = () => {
    this.store.dispatch(omnibridgeUIActions.setModalDisclaimerText('Content to be discussed'))
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.pendingTxListener, 5000))
  }

  private pendingTxListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTxs(this.store.getState(), this._account)

    if (!pendingTransactions.length) return

    const promises = pendingTransactions.map(async tx => {
      try {
        const status = await ServerAPI.appControllerGetBridgingStatus({
          fromChainId: tx.fromChainId.toString(),
          toChainId: tx.toChainId.toString(),
          transactionHash: tx.txHash
        })

        if (status.success) {
          const txStatus = status.result.destinationTransactionHash
            ? 'confirmed'
            : status.result.sourceTxStatus === BridgeStatusResponseSourceTxStatusEnum.Completed
            ? 'to-pending'
            : 'from-pending'

          this.store.dispatch(
            this.actions.updateTx({
              txHash: tx.txHash,
              partnerTxHash: status.result.destinationTransactionHash,
              status: txStatus
            })
          )
        } else {
          this.actions.updateTx({
            txHash: tx.txHash,
            status: 'error'
          })
        }
      } catch (e) {
        this.actions.updateTx({
          txHash: tx.txHash,
          status: 'error'
        })
      }
    })

    await Promise.all(promises)
  }
}
