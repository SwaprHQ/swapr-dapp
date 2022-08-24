import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Currency } from '@swapr/sdk'

import { TokenInfo, TokenList } from '@uniswap/token-lists'

import SocketLogo from '../../../assets/images/socket-logo.png'
import { SOCKET_NATIVE_TOKEN_ADDRESS } from '../../../constants'
import {
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SocketList,
  SyncState,
} from '../EcoBridge.types'
import { EcoBridgeChildBase, getErrorMsg } from '../EcoBridge.utils'
import { commonActions } from '../store/Common.reducer'
import { ecoBridgeUIActions } from '../store/UI.reducer'
import { ApprovalsAPI, QuoteAPI, ServerAPI, TokenListsAPI } from './api'
import {
  BridgeStatusResponseSourceTxStatusEnum,
  QuoteControllerGetQuoteSortEnum,
  QuoteOutputDTO,
  TokenPriceResponseDTO,
} from './api/generated'
import { socketActions } from './Socket.reducer'
import { socketSelectors } from './Socket.selectors'
import { SocketTokenMap, SocketTxStatus } from './Socket.types'
import { getBestRoute, getStatusOfResponse, overrideTokensAddresses, SOCKET_LISTS_URL, VERSION } from './Socket.utils'

export class SocketBridge extends EcoBridgeChildBase {
  private _tokenLists: SocketTokenMap = {}
  private _listeners: NodeJS.Timeout[] = []
  private _abortControllers: { [id: string]: AbortController } = {}

  constructor({ supportedChains, bridgeId, displayName = 'Socket' }: EcoBridgeChildBaseConstructor) {
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

  private renewAbortController = (key: string) => {
    if (this._abortControllers[key]) {
      this._abortControllers[key].abort()
    }

    this._abortControllers[key] = new AbortController()

    return this._abortControllers[key].signal
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    this.startListeners()
  }

  public onSignerChange = async ({ ...signerData }: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public collect = () => undefined

  public triggerBridging = async () => {
    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const { data, to: recipient } = this.selectors.selectTxBridgingData(this.store.getState())
    const { from, to } = this.store.getState().ecoBridge.ui

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
      const value =
        from.address === Currency.getNative(from.chainId).symbol ? parseUnits(from.value, from.decimals) : undefined

      const tx = await this._activeProvider?.getSigner().sendTransaction({
        to: recipient,
        data,
        value,
      })

      if (!tx) return

      // @TODO: can be improved later with a better way to get the toValue
      const routeId = this.store.getState().ecoBridge.common.activeRouteId
      const routes = this.selectors.selectRoutes(this.store.getState())
      const selectedRoute = routes.find(route => route.routeId === routeId)

      const toValue = (parseUnits(selectedRoute?.toAmount ?? '0', to.decimals) ?? 0).toString()
      const fromValue = Number(value ?? 0).toString()

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

      this.store.dispatch(
        this.actions.addTx({
          sender: this._account,
          txHash: tx.hash,
          assetName: from.symbol,
          fromValue,
          toValue,
          fromChainId: from.chainId,
          toChainId: to.chainId,
          bridgeId: this.bridgeId,
          assetAddressL1: from.address,
          assetAddressL2: to.address,
        })
      )
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
        amount,
      })

      if (!transaction.success) return

      const txn = await this._activeProvider?.getSigner().sendTransaction({
        to: transaction.result.to,
        data: transaction.result.data,
      })

      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Approving',
          isError: false,
          isLoading: true,
          isBalanceSufficient: true,
          isApproved: false,
        })
      )

      const receipt = await txn?.wait()
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

    return
  }

  public validate = async () => {
    const routeId = this.store.getState().ecoBridge.common.activeRouteId
    const routes = this.selectors.selectRoutes(this.store.getState())

    //this shouldn't happen because validation on front not allowed to set bridge which status is "failed"
    if (!routeId || !routes) return

    //find route
    const selectedRoute = routes.find(route => route.routeId === routeId)

    if (!selectedRoute) return
    //build txn

    try {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({ label: 'Loading', isLoading: true, isError: false, isApproved: false })
      )
      const transaction = await ServerAPI.appControllerGetSingleTx(
        {
          singleTxDTO: { route: selectedRoute },
        },
        { signal: this.renewAbortController('singleTx') }
      )

      if (!transaction.success) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Something went wrong',
            isLoading: false,
            isError: true,
            isApproved: false,
            isBalanceSufficient: false,
          })
        )
        return
      }

      const {
        result: { txTarget, txData, approvalData },
      } = transaction

      //push txData to store
      this.store.dispatch(this.actions.setTxBridgingData({ to: txTarget, data: txData }))

      if (!approvalData) {
        //when approvalData === null user can bridge
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
        //check allowance

        const activeChainId = this.store.getState().ecoBridge.ui.from.chainId

        if (!activeChainId || !this._account) return

        const allowance = await ApprovalsAPI.approveControllerFetchApprovals(
          {
            chainID: activeChainId.toString(),
            owner: this._account,
            allowanceTarget: approvalData.allowanceTarget.toString(),
            tokenAddress: approvalData.approvalTokenAddress.toString(),
          },
          { signal: this.renewAbortController('allowance') }
        )

        const {
          result: { value },
          success,
        } = allowance

        if (success) {
          if (BigNumber.from(value).lt(BigNumber.from(approvalData.minimumApprovalAmount))) {
            this.store.dispatch(
              this.actions.setApprovalData({
                chainId: activeChainId ? activeChainId : 1,
                allowanceTarget: approvalData.allowanceTarget,
                tokenAddress: approvalData.approvalTokenAddress,
                amount: approvalData.minimumApprovalAmount,
                owner: approvalData.owner,
              })
            )

            this.store.dispatch(
              ecoBridgeUIActions.setStatusButton({
                label: 'Approve',
                isLoading: false,
                isError: false,
                isApproved: false,
                isBalanceSufficient: true,
              })
            )
            return
          }

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
              label: 'Something went wrong',
              isLoading: false,
              isError: true,
              isApproved: false,
              isBalanceSufficient: false,
            })
          )
        }
      }
    } catch (e) {
      const isValid = getStatusOfResponse(e)
      if (!isValid) {
        this.store.dispatch(
          ecoBridgeUIActions.setBridgeModalStatus({
            status: BridgeModalStatus.ERROR,
            error: getErrorMsg(e, this.bridgeId),
          })
        )
      }
    }
  }

  private _fetchSocketRoutes = async ({
    fromChainId,
    fromTokenAddress,
    toTokenAddress,
    toChainId,
    fromAmount,
    helperRequestId,
  }: {
    fromChainId: string
    fromTokenAddress: string
    toTokenAddress: string
    toChainId: string
    fromAmount: string
    helperRequestId: number
  }) => {
    if (!this._account) return

    let quote: QuoteOutputDTO | undefined

    try {
      quote = await QuoteAPI.quoteControllerGetQuote(
        {
          fromChainId,
          fromTokenAddress,
          toTokenAddress,
          toChainId,
          fromAmount,
          userAddress: this._account,
          uniqueRoutesPerBridge: false,
          disableSwapping: false,
          sort: QuoteControllerGetQuoteSortEnum.Output,
          singleTxOnly: true,
        },
        { signal: this.renewAbortController('quote') }
      )
    } catch (e) {
      //if status of response isn't 20 (aborted) then set socket status to failed
      const isValid = getStatusOfResponse(e)
      if (!isValid) {
        this.store.dispatch(
          this.actions.setBridgeDetailsStatus({
            status: SyncState.FAILED,
            errorMessage: 'No available routes / details',
          })
        )
        return
      }
    }
    if (!quote) return

    const { success, result } = quote

    if (!success || result.routes.length === 0) {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({
          status: SyncState.FAILED,
          errorMessage: 'No available routes / details',
        })
      )
      return
    }
    const { routes, toAsset } = result

    this.store.dispatch(this.actions.setRoutes(routes))

    let tokenData: TokenPriceResponseDTO | undefined

    try {
      tokenData = await ServerAPI.appControllerGetTokenPrice({
        tokenAddress: toAsset.address,
        chainId: toAsset.chainId,
      })
    } catch (e) {}

    const bestRoute = getBestRoute(routes, tokenData, toAsset.decimals)

    if (!bestRoute) {
      this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
      return
    }

    const { toAmount, serviceTime, totalGasFeesInUsd, routeId } = bestRoute

    const formattedToAmount = Number(formatUnits(toAmount, result.toAsset.decimals)).toFixed(2).toString()

    this.store.dispatch(commonActions.setActiveRouteId(routeId))

    const details = {
      gas: `${totalGasFeesInUsd.toFixed(2).toString()}$`,
      estimateTime: `${(serviceTime / 60).toFixed(0).toString()} min`,
      receiveAmount: formattedToAmount,
      requestId: helperRequestId,
    }

    this.store.dispatch(this.actions.setBridgeDetails(details))
  }

  public getBridgingMetadata = async () => {
    if (!this.store) {
      console.warn('No store found.')
      return
    }

    const ecoBridgeState = this.store.getState().ecoBridge

    const { isBridgeSwapActive, from, to } = ecoBridgeState.ui

    const requestId = ecoBridgeState[this.bridgeId as SocketList].lastMetadataCt

    const helperRequestId = (requestId ?? 0) + 1

    this.store.dispatch(this.actions.requestStarted({ id: helperRequestId }))

    // reset previous data
    this.store.dispatch(
      this.actions.setApprovalData({
        allowanceTarget: undefined,
        amount: undefined,
        chainId: undefined,
        owner: undefined,
        tokenAddress: undefined,
      })
    )
    this.store.dispatch(this.actions.setRoutes([]))

    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

    if (!from.chainId || !to.chainId || !this._account || !from.address || Number(from.value) === 0) return

    let value = BigNumber.from(0)

    //handling small amounts
    try {
      value = parseUnits(from.value, from.decimals)
    } catch (e) {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({
          status: SyncState.FAILED,
          errorMessage: 'No available routes / details',
        })
      )
      return
    }

    if (isBridgeSwapActive) {
      await this._fetchSocketRoutes({
        fromChainId: from.chainId.toString(),
        fromTokenAddress:
          from.address === Currency.getNative(from.chainId).symbol ? SOCKET_NATIVE_TOKEN_ADDRESS : from.address,
        toTokenAddress: to.address === Currency.getNative(to.chainId).symbol ? SOCKET_NATIVE_TOKEN_ADDRESS : to.address,
        toChainId: to.chainId.toString(),
        fromAmount: value.toString(),
        helperRequestId,
      })
    } else {
      const socketTokens = this.store.getState().ecoBridge.socket.lists[this.bridgeId]
      const fromNativeCurrency = Currency.getNative(from.chainId)

      let fromTokenAddress = ''
      let toTokenAddress = ''

      const overrideTokens = overrideTokensAddresses({
        toChainId: to.chainId,
        fromChainId: from.chainId,
        fromAddress: from.address,
      })

      if (overrideTokens) {
        const { fromTokenAddressOverride, toTokenAddressOverride } = overrideTokens

        fromTokenAddress = fromTokenAddressOverride
        toTokenAddress = toTokenAddressOverride
      }

      // Default pairing
      if (!toTokenAddress && !fromTokenAddress) {
        if (from.address === fromNativeCurrency.symbol) {
          fromTokenAddress = SOCKET_NATIVE_TOKEN_ADDRESS
          toTokenAddress = SOCKET_NATIVE_TOKEN_ADDRESS
        } else {
          const fromToken = socketTokens.tokens.find(
            token => token.address.toLowerCase() === from.address.toLowerCase()
          )

          if (!fromToken) {
            this.store.dispatch(
              this.actions.setBridgeDetailsStatus({
                status: SyncState.FAILED,
                errorMessage: 'No available routes / details',
              })
            )
            return
          }

          const toToken = socketTokens.tokens.find(
            token => token.symbol === fromToken.symbol && token.chainId === to.chainId
          )

          if (!toToken) {
            this.store.dispatch(
              this.actions.setBridgeDetailsStatus({
                status: SyncState.FAILED,
                errorMessage: 'No available routes / details',
              })
            )
            return
          }

          fromTokenAddress = fromToken.address
          toTokenAddress = toToken.address
        }
      }

      await this._fetchSocketRoutes({
        fromChainId: from.chainId.toString(),
        fromTokenAddress,
        toTokenAddress,
        toChainId: to.chainId.toString(),
        fromAmount: value.toString(),
        helperRequestId,
      })
    }
  }

  public fetchDynamicLists = async () => {
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId },
      isBridgeSwapActive,
    } = this.store.getState().ecoBridge.ui

    if (!fromChainId || !toChainId) return

    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.LOADING))

    let tokenList: TokenList | undefined

    if (isBridgeSwapActive) {
      const tokenListParameters = {
        fromChainId: fromChainId.toString(),
        toChainId: toChainId.toString(),
        isShortList: false,
        disableSwapping: false,
        singleTxOnly: true,
      }

      try {
        const [fromTokenList, toTokenList] = await Promise.all([
          TokenListsAPI.tokenListControllerGetfromTokenList(tokenListParameters),
          TokenListsAPI.tokenListControllerGetToTokenList(tokenListParameters),
        ])

        const tokens = [...fromTokenList.result, ...toTokenList.result].reduce<TokenInfo[]>((allTokens, token) => {
          const { address, chainId, symbol, decimals, icon, name } = token

          // remove native currency from fromTokenList
          if (address === SOCKET_NATIVE_TOKEN_ADDRESS && symbol === Currency.getNative(fromChainId).symbol)
            return allTokens

          allTokens.push({
            address,
            chainId: Number(chainId),
            symbol,
            decimals: decimals ?? 18,
            name: name ?? '',
            logoURI: icon,
          })

          return allTokens
        }, [])

        tokenList = {
          name: 'Socket',
          timestamp: new Date().toISOString(),
          version: VERSION,
          logoURI: SocketLogo,
          tokens,
        }
      } catch (e) {
        throw new Error('Failed to fetch Socket token lists')
      }
    } else {
      const tokenListKey = `${Math.min(Number(fromChainId), Number(toChainId))}-${Math.max(
        Number(fromChainId),
        Number(toChainId)
      )}`

      tokenList = {
        name: 'Socket',
        timestamp: new Date().toISOString(),
        version: VERSION,
        logoURI: SocketLogo,
        tokens: this._tokenLists[tokenListKey] ?? [],
      }
    }

    this.store.dispatch(this.actions.addTokenLists({ socket: tokenList as TokenList }))
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
  }

  public fetchStaticLists = async () => {
    try {
      const socketListsResponse = await fetch(SOCKET_LISTS_URL)
      const socketLists: { data: SocketTokenMap } = await socketListsResponse.json()
      this._tokenLists = socketLists.data
    } catch (e) {
      throw new Error('Failed to fetch Socket token lists')
    }

    this.store.dispatch(commonActions.activateLists(['socket']))
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.pendingTxListener, 5000))
  }

  private pendingTxListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTransactions(this.store.getState(), this._account)

    if (!pendingTransactions.length) return

    const promises = pendingTransactions.map(async tx => {
      try {
        const status = await ServerAPI.appControllerGetBridgingStatus({
          fromChainId: tx.fromChainId.toString(),
          toChainId: tx.toChainId.toString(),
          transactionHash: tx.txHash,
        })

        if (status.success) {
          const txStatus = status.result.destinationTransactionHash
            ? SocketTxStatus.CONFIRMED
            : status.result.sourceTxStatus === BridgeStatusResponseSourceTxStatusEnum.Completed
            ? SocketTxStatus.TO_PENDING
            : SocketTxStatus.FROM_PENDING

          this.store.dispatch(
            this.actions.updateTx({
              txHash: tx.txHash,
              partnerTxHash: status.result.destinationTransactionHash,
              status: txStatus,
            })
          )
        } else {
          this.actions.updateTx({
            txHash: tx.txHash,
            status: SocketTxStatus.ERROR,
          })
        }
      } catch (e) {
        this.actions.updateTx({
          txHash: tx.txHash,
          status: SocketTxStatus.ERROR,
        })
      }
    })

    await Promise.all(promises)
  }
}
