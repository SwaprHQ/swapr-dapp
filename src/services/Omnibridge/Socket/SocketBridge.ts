import { parseUnits } from '@ethersproject/units'
import { OmnibridgeChildBaseConstructor, OmnibridgeChildBaseInit, OmnibridgeChangeHandler } from '../Omnibridge.types'
import { OmnibridgeChildBase } from '../Omnibridge.utils'
// import { socketActions } from './Socket.reducer'
import { SocketList } from '../Omnibridge.types'
import { socketActions } from './Socket.reducer'
import { socketSelectors } from './Socket.selectors'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { BigNumber } from 'ethers'
import { QuoteAPI, ServerAPI, ApprovalsAPI } from './api'
import { QuoteControllerGetQuoteSortEnum } from './api/generated'
import { BridgeModalStatus } from '../../../state/bridge/reducer'

let previousController: AbortController
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

    if (!data || !to) return

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

    try {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, approved: false })
      )
      const transaction = await ServerAPI.appControllerGetSingleTx({
        singleTxDTO: { route: selectedRoute }
      })

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

      //push txData to store
      this.store.dispatch(
        this.actions.setTxBridgingData({ to: transaction.result.txTarget, data: transaction.result.txData })
      )

      if (!transaction.result.approvalData) {
        //user can bridge now approvalData === null is same as token
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
        const activeChainId = this.store.getState().omnibridge.UI.from.chainId //maybe can use this._activeChainId
        const allowance = await ApprovalsAPI.approveControllerFetchApprovals({
          chainID: activeChainId ? activeChainId?.toString() : '1',
          owner: this._account ? this._account : '',
          allowanceTarget: transaction.result.approvalData.allowanceTarget as string,
          tokenAddress: transaction.result.approvalData.approvalTokenAddress as string
        })

        if (allowance.success) {
          if (
            BigNumber.from(allowance.result.value).lt(
              BigNumber.from(transaction.result.approvalData.minimumApprovalAmount)
            )
          ) {
            this.store.dispatch(
              this.actions.setApprovalData({
                chainId: activeChainId ? activeChainId : 1,
                allowanceTarget: transaction.result.approvalData.allowanceTarget,
                tokenAddress: transaction.result.approvalData.approvalTokenAddress,
                amount: transaction.result.approvalData.minimumApprovalAmount,
                owner: transaction.result.approvalData.owner
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

    const health = await ServerAPI.appControllerGetHealth()

    if (previousController) {
      previousController.abort()
    }

    if (health.ok) {
      previousController = new AbortController()

      const { from, to } = this.store.getState().omnibridge.UI
      if (!from.address || Number(from.value) === 0) return

      const value = parseUnits(from.value, from.decimals)

      const quote = await QuoteAPI.quoteControllerGetQuote({
        fromChainId: from.chainId ? from.chainId.toString() : '1',
        fromTokenAddress: from.address,
        toChainId: to.chainId ? to.chainId.toString() : '42161',
        toTokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //TODO to address
        fromAmount: value.toString(),
        userAddress: this._account ? this._account : '',
        uniqueRoutesPerBridge: false,
        disableSwapping: false,
        sort: QuoteControllerGetQuoteSortEnum.Output,
        singleTxOnly: true
      })

      const tokenDetails = quote.result.toAsset
      const routesData = { tokenDetails, routes: quote.result.routes }

      if (quote.success) {
        this.store.dispatch(this.actions.setBridgeDetails(routesData))
        this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'ready' }))
      } else {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
        )
      }
    } else {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({ status: 'failed', errorMessage: 'No available routes / details' })
      )
    }
  }

  public fetchDynamicLists = () => {
    return Promise.resolve()
  }
  public fetchStaticLists = () => {
    return Promise.resolve()
  }
}
