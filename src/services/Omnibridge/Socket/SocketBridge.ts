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
import { QuoteControllerGetQuoteSortEnum, TokenAsset } from './api/generated'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import SocketLogo from '../../../assets/images/socket-logo.png'
import { commonActions } from '../store/Common.reducer'
import { isFee, SOCKET_NATIVE_TOKEN_ADDRESS } from './Socket.types'

const getErrorMsg = (error: any) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  return `Bridge failed: ${error.message}`
}
export class SocketBridge extends OmnibridgeChildBase {
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
  }

  public onSignerChange = async ({ ...signerData }: OmnibridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public collect = () => undefined

  public triggerCollect = () => undefined

  public triggerBridging = async () => {
    //get txData from store
    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))
    const { from, to } = this.store.getState().omnibridge.UI

    const { data, to: recipient } = this.selectors.selectTxBridgingData(this.store.getState())

    if (!data || !recipient) return

    try {
      const tx = await this._activeProvider?.getSigner().sendTransaction({
        to: recipient,
        data
      })

      this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
      const receipt = await tx?.wait()

      this.store.dispatch(
        this.actions.addTx({
          txHash: tx?.hash ? tx.hash : '',
          assetName: from.address.substr(0, 2), //TODO find way to get asset name
          value: to.value,
          fromChainId: from.chainId ? from.chainId : 1,
          toChainId: to.chainId ? to.chainId : 42161,
          bridgeId: this.bridgeId
        })
      )

      if (receipt) {
        this.store.dispatch(
          this.actions.updateTx({
            txHash: receipt.transactionHash
          })
        )
      }
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
    if (!routeId || !routes || !routes) return

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

    if (from.address !== 'ETH') {
      //way to find from and toToken
      const fromToken = socketTokens.tokens.find(token => token.address.toLowerCase() === from.address.toLowerCase())
      if (!fromToken) {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
        )
        return
      }

      const toToken = socketTokens.tokens.find(
        token => token.symbol === fromToken.symbol && token.chainId === to.chainId
      )
      if (!toToken) {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
        )
        return
      }

      fromTokenAddress = from.address
      toTokenAddress = toToken.address
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

    const tokenData = await ServerAPI.appControllerGetTokenPrice({
      tokenAddress: toAsset.address,
      chainId: toAsset.chainId
    })

    const {
      result: { tokenPrice } //token price in USD
    } = tokenData

    const bestRoute = routes.reduce<{ amount: number; routeId: string }>(
      (total, next) => {
        if (tokenData.success) {
          const amount = (
            Number(formatUnits(next.toAmount, toAsset.decimals).toString()) * tokenPrice -
            next.totalGasFeesInUsd
          ).toFixed(2)

          const route = {
            amount: Number(amount),
            routeId: next.routeId
          }

          //find better way to do it
          if (route.amount <= 0) {
            if (total.amount <= route.amount && total.amount !== 0) {
              total = route
              return total
            }

            total = route
          } else {
            if (total.amount <= route.amount) {
              total = route
            }
          }

          return total
        }
        return total
      },
      { amount: 0, routeId: '' } as { amount: number; routeId: string }
    )

    const indexOfBestRoute = routes.findIndex(route => route.routeId === bestRoute.routeId)

    if (indexOfBestRoute === -1) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'failed' }))
      return
    }

    const { toAmount, serviceTime, totalGasFeesInUsd, routeId, userTxs } = routes[indexOfBestRoute]
    //set route
    this.store.dispatch(commonActions.setActiveRouteId(routeId))

    const getBridgeFee = (userTxs: any): string => {
      if (isFee(userTxs)) {
        //CHECK
        // protocolFees has two parameters {amount,feesInUsd}
        // amount - fee but in token representation
        // feesInUsd - i have not seen this value other than 0
        //should we use both and sum ? (for now we sum it)
        const formattedAmount = Number(
          formatUnits(userTxs[0].steps[0].protocolFees.amount, toAsset.decimals).toString()
        ) //it's amount of token

        const feesInToken = formattedAmount * tokenPrice
        const feesInUsd = userTxs[0].steps[0].protocolFees.feesInUsd

        const fee = `${(feesInToken + feesInUsd).toFixed(2).toString()} $`

        return fee
      }

      //this shouldn't happen
      return '---'
    }

    const fee = getBridgeFee(userTxs)

    const details = {
      gas: `${totalGasFeesInUsd.toFixed(2).toString()} $`,
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

  public fetchStaticLists = async () => undefined

  public triggerModalDisclaimerText = () => {
    this.store.dispatch(omnibridgeUIActions.setModalDisclaimerText('Content to be discussed'))
  }
}
