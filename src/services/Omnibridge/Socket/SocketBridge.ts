import { parseUnits } from '@ethersproject/units'
import { OmnibridgeChildBaseConstructor, OmnibridgeChildBaseInit, OmnibridgeChangeHandler } from '../Omnibridge.types'
import { OmnibridgeChildBase } from '../Omnibridge.utils'
// import { socketActions } from './Socket.reducer'
import { Quote } from './Socket.types'
import { SocketList } from '../Omnibridge.types'
import { socketActions } from './Socket.reducer'
import { socketSelectors } from './Socket.selectors'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { BigNumber } from 'ethers'
import { TokenListsAPI } from './api'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import SocketLogo from '../../../assets/images/socket-logo.png'

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
    const { from, to } = this.store.getState().omnibridge.UI

    const { data, to: recipient } = this.selectors.selectTxBridgingData(this.store.getState())

    if (!data || !to) return

    const tx = await this._activeProvider?.getSigner().sendTransaction({
      to: recipient,
      data
    })

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
      const response = await fetch(
        `https://backend.movr.network/v2/approval/build-tx?chainID=${chainId}&owner=${owner}&allowanceTarget=${allowanceTarget}&tokenAddress=${tokenAddress}&amount=${amount}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
          }
        }
      )
      const transaction = await response.json()

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
      throw new Error('Cannot build tx ')
    }

    return
  }

  public validate = async () => {
    const routeId = this.store.getState().omnibridge.common.activeRouteId
    const routes = this.selectors.selectRoutes(this.store.getState())

    //this shouldn't happen because validation on front not allowed to set bridge which status is "failed"
    if (!routeId || !routes) return

    //find route
    const selectedRoute = routes.routes.find(route => route.routeId === routeId)

    //build txn
    try {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, approved: false })
      )
      const response = await fetch('https://backend.movr.network/v2/build-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
        },
        body: JSON.stringify({ route: selectedRoute })
      })
      const transaction = await response.json()

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
        const response = await fetch(
          `https://backend.movr.network/v2/approval/check-allowance?chainID=${activeChainId}&owner=${this._account}&allowanceTarget=${transaction.result.approvalData.allowanceTarget}&tokenAddress=${transaction.result.approvalData.approvalTokenAddress}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
            }
          }
        )
        const allowance = await response.json()

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
      throw new Error('Cannot build tx')
    }
  }

  public getBridgingMetadata = async () => {
    //check health socket server
    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: 'loading' }))

    const response = await fetch('https://backend.movr.network/v2/health', {
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
      }
    })
    const health: { ok: boolean } = await response.json()

    if (this._abortControllers.quote) {
      this._abortControllers.quote.abort()
    }

    if (health.ok) {
      this._abortControllers.quote = new AbortController()

      const { from, to } = this.store.getState().omnibridge.UI
      if (!from.address || Number(from.value) === 0) return

      const value = parseUnits(from.value, from.decimals)

      //TODO get to token address
      const response = await fetch(
        `https://backend.movr.network/v2/quote?fromChainId=${from.chainId}&fromTokenAddress=${from.address}&toChainId=${to.chainId}&toTokenAddress=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&fromAmount=${value}&userAddress=${this._account}&uniqueRoutesPerBridge=false&disableSwapping=false&sort=output&singleTxOnly=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
          },
          signal: this._abortControllers.quote.signal
        }
      )
      const quote: Quote = await response.json()

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

    const tokens: TokenInfo[] = [...tokenListFrom.result, ...tokenListTo.result].reduce<TokenInfo[]>((total, token) => {
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
}
