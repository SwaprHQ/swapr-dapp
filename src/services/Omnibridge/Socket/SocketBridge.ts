import { parseUnits } from '@ethersproject/units'
import { OmnibridgeChildBaseConstructor, OmnibridgeChildBaseInit, OmnibridgeChangeHandler } from '../Omnibridge.types'
import { OmnibridgeChildBase } from '../Omnibridge.utils'
import { SocketList } from '../Omnibridge.types'
import { socketActions } from './Socket.reducer'
import { socketSelectors } from './Socket.selectors'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { BigNumber } from 'ethers'
import { QuoteAPI, ServerAPI, ApprovalsAPI } from './api'
import { QuoteControllerGetQuoteSortEnum, TokenAsset } from './api/generated'
import { BridgeModalStatus } from '../../../state/bridge/reducer'

import { TokenListsAPI } from './api'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import SocketLogo from '../../../assets/images/socket-logo.png'

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

  private _abortControllers: { [id: string]: AbortController } = {}

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: OmnibridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })
  }

  public onSignerChange = async ({ ...signerData }: OmnibridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public collect = () => {
    return
  }
  public triggerCollect = () => {
    return {
      symbol: '',
      typedValue: '',
      fromChainId: 1,
      toChainId: 1
    }
  }
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
    if (!routeId || !routes?.routes || !routes) return

    //find route
    const selectedRoute = routes.routes.find(route => route.routeId === routeId)

    if (!selectedRoute) return
    //build txn

    if (this._abortControllers.singleTx) {
      this._abortControllers.singleTx.abort()
    }

    this._abortControllers.singleTx = new AbortController()

    try {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, approved: false })
      )
      const transaction = await ServerAPI.appControllerGetSingleTx(
        {
          singleTxDTO: { route: selectedRoute }
        },
        { signal: this._abortControllers.singleTx.signal }
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
        if (this._abortControllers.allowance) {
          this._abortControllers.allowance.abort()
        }

        this._abortControllers.allowance = new AbortController()

        const activeChainId = this.store.getState().omnibridge.UI.from.chainId

        if (!activeChainId || !this._account) return

        const allowance = await ApprovalsAPI.approveControllerFetchApprovals(
          {
            chainID: activeChainId.toString(),
            owner: this._account,
            allowanceTarget: approvalData.allowanceTarget.toString(),
            tokenAddress: approvalData.approvalTokenAddress.toString()
          },
          { signal: this._abortControllers.allowance.signal }
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
    //check health socket server
    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'loading' }))

    if (this._abortControllers.health) {
      this._abortControllers.health.abort()
    }

    this._abortControllers.health = new AbortController()

    const health = await ServerAPI.appControllerGetHealth({ signal: this._abortControllers.health.signal })

    if (this._abortControllers.quote) {
      this._abortControllers.quote.abort()
    }

    if (health.ok) {
      this._abortControllers.quote = new AbortController()

      const { from, to } = this.store.getState().omnibridge.UI
      if (!from.address || Number(from.value) === 0) return

      const socketTokens = this.store.getState().omnibridge.socket.lists[this.bridgeId]

      const fromToken = socketTokens.tokens.find(token => token.address.toLowerCase() === from.address.toLowerCase())

      if (!fromToken) return

      const toToken = socketTokens.tokens.find(
        token => token.symbol === fromToken.symbol && token.chainId === to.chainId
      )

      if (!toToken) return

      const value = parseUnits(from.value, from.decimals)

      const quote = await QuoteAPI.quoteControllerGetQuote(
        {
          fromChainId: from.chainId ? from.chainId.toString() : '1',
          fromTokenAddress: from.address,
          toChainId: to.chainId ? to.chainId.toString() : '42161',
          toTokenAddress: toToken.address,
          fromAmount: value.toString(),
          userAddress: this._account ? this._account : '',
          uniqueRoutesPerBridge: false,
          disableSwapping: false,
          sort: QuoteControllerGetQuoteSortEnum.Output,
          singleTxOnly: true
        },
        { signal: this._abortControllers.quote.signal }
      )

      const tokenDetails = quote.result.toAsset
      const routesData = { tokenDetails, routes: quote.result.routes }

      if (quote.success) {
        if (quote.result.routes.length === 0) {
          this.store.dispatch(
            this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
          )
          return
        }
        this.store.dispatch(this.actions.setBridgeDetails(routesData))
        this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'ready' }))
      } else {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
        )
      }
    } else {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'Bridge is not available now' })
      )
    }
  }

  public fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId }
    } = this.store.getState().omnibridge.UI

    if (!fromChainId || !toChainId) return

    // Abort previous calls

    if (this._abortControllers.tokenListFrom) {
      this._abortControllers.tokenListFrom.abort()
    }

    if (this._abortControllers.tokenListTo) {
      this._abortControllers.tokenListTo.abort()
    }

    this._abortControllers.tokenListFrom = new AbortController()
    this._abortControllers.tokenListTo = new AbortController()

    this.store.dispatch(this.actions.setTokenListsStatus('loading'))

    const payload = {
      fromChainId: fromChainId.toString(),
      toChainId: toChainId.toString()
    }

    const tokenListToPromise = TokenListsAPI.tokenListControllerGetToTokenList(payload, {
      signal: this._abortControllers.tokenListFrom.signal
    })
    const tokenListFromPromise = TokenListsAPI.tokenListControllerGetfromTokenList(payload, {
      signal: this._abortControllers.tokenListTo.signal
    })

    const [tokenListFrom, tokenListTo] = await Promise.all([tokenListFromPromise, tokenListToPromise])

    //TODO find better way
    const pairedTokens = tokenListFrom.result.reduce<TokenAsset[]>((total, fromToken) => {
      if (!fromToken.symbol) return total

      const toToken = tokenListTo.result.find(
        token =>
          token.symbol === fromToken.symbol &&
          fromToken.address.toLowerCase() !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase()
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

  public fetchStaticLists = () => {
    return Promise.resolve()
  }
  public triggerModalDisclaimerText = () => {
    this.store.dispatch(omnibridgeUIActions.setModalDisclaimerText('Content to be discussed'))
  }
}
