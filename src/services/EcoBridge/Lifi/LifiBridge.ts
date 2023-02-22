import { Currency } from '@swapr/sdk'

import { Route } from '@lifi/sdk'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import LifiLogo from '../../../assets/images/lifi-logo.png'
import {
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
} from '../EcoBridge.types'
import { EcoBridgeChildBase } from '../EcoBridge.utils'
import { overrideTokensAddresses } from '../Socket/Socket.utils'
import { LifiList } from './../EcoBridge.types'
import { LifiApi } from './Lifi.api'
import { NATIVE_TOKEN_ADDRESS, VERSION } from './Lifi.constants'
import { lifiActions } from './Lifi.reducer'
import { LifiTokenMap } from './Lifi.types'
import { LifiChainShortNames } from './Lifi.utils'

export class LifiBridge extends EcoBridgeChildBase {
  private _tokenLists: LifiTokenMap = {}

  constructor({ supportedChains, bridgeId, displayName = 'Lifi' }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })
    this.setBaseActions(this.actions)
  }

  private get actions() {
    return lifiActions[this.bridgeId as LifiList]
  }

  public collect = () => undefined
  public approve = () => undefined
  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    //this.ecoBridgeUtils.listeners.start([{ listener: this.pendingTxListener }])
  }
  public fetchDynamicLists = async () => {
    console.log({ state: this.store.getState().ecoBridge.ui })
    const {
      from: { chainId: fromChainId },
      to: { chainId: toChainId },
    } = this.store.getState().ecoBridge.ui
    if (!LifiChainShortNames.get(fromChainId) || !LifiChainShortNames.get(toChainId)) return
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.LOADING))

    let tokenList: TokenList = {
      name: 'Lifi',
      timestamp: new Date().toISOString(),
      version: VERSION,
      logoURI: LifiLogo,
      tokens: [],
    }

    // if (isBridgeSwapActive) {
    try {
      const { fromChainTokens, toChainTokens } = await LifiApi.getTokenList(fromChainId, toChainId)
      const tokens = [...fromChainTokens, ...toChainTokens].reduce<TokenInfo[]>((allTokens, token) => {
        const { address, chainId, symbol, decimals, logoURI, name } = token

        // remove native currency from fromTokenList
        if (address === NATIVE_TOKEN_ADDRESS && symbol === Currency.getNative(fromChainId).symbol) return allTokens

        allTokens.push({
          address,
          chainId: Number(chainId),
          symbol,
          decimals: decimals ?? 18,
          name: name ?? '',
          logoURI,
        })

        return allTokens
      }, [])

      tokenList = {
        name: 'Lifi',
        timestamp: new Date().toISOString(),
        version: VERSION,
        logoURI: LifiLogo,
        tokens,
      }
    } catch (e) {
      throw this.ecoBridgeUtils.logger.error('Failed to fetch Lifi token lists')
    }
    // }

    this.store.dispatch(this.baseActions.addTokenLists({ lifi: tokenList as TokenList }))
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.READY))
  }
  public fetchStaticLists = () => {
    return {} as Promise<void>
  }
  public getBridgingMetadata = async () => {
    const ecoBridgeState = this.store.getState().ecoBridge
    const { from, to } = ecoBridgeState.ui
    const requestId = this.ecoBridgeUtils.metadataStatus.start()

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

    if (!from.chainId || !to.chainId || !this._account || !from.address || Number(from.value) === 0) return

    let value = BigNumber.from(0)

    //handling small amounts
    try {
      value = parseUnits(from.value, from.decimals)
    } catch (e) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }

    const lifiTokens = this.store.getState().ecoBridge.lifi.lists[this.bridgeId]
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
        fromTokenAddress = NATIVE_TOKEN_ADDRESS
        toTokenAddress = NATIVE_TOKEN_ADDRESS
      } else {
        const fromToken = lifiTokens.tokens.find(token => token.address.toLowerCase() === from.address.toLowerCase())

        if (!fromToken) {
          this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
          return
        }

        const toToken = lifiTokens.tokens.find(
          token => token.symbol === fromToken.symbol && token.chainId === to.chainId
        )

        if (!toToken) {
          this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
          return
        }

        fromTokenAddress = fromToken.address
        toTokenAddress = toToken.address
      }
    }

    await this._getLifiRoutes({
      fromChainId: from.chainId,
      fromTokenAddress,
      toTokenAddress,
      toChainId: to.chainId,
      fromAmount: value.toString(),
      requestId,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSignerChange = async (data: EcoBridgeChangeHandler) => {
    return {} as Promise<void>
  }
  private _getLifiRoutes = async ({
    fromChainId,
    fromTokenAddress,
    toTokenAddress,
    toChainId,
    fromAmount,
    requestId,
  }: {
    fromChainId: number
    fromTokenAddress: string
    toTokenAddress: string
    toChainId: number
    fromAmount: string
    requestId: number
  }) => {
    if (!this._account) return

    let routes: Route[]

    try {
      routes = await LifiApi.getRoutes({
        fromChainId,
        fromTokenAddress,
        toTokenAddress,
        toChainId,
        fromAmount,
        fromAddress: this._account,
      })
    } catch (e) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }
    if (!routes) return

    if (routes.length === 0) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }

    this.store.dispatch(this.actions.setRoutes(routes))
    // Need to calculate the recommended route
    const bestRoute = routes[0]
    if (bestRoute === undefined) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }
    const { toAmount, gasCostUSD: totalGasFeesInUsd, id: routeId, steps, toToken } = bestRoute
    const executionDuration = steps[0]?.estimate?.executionDuration

    const formattedToAmount = Number(formatUnits(toAmount, toToken.decimals))
      .toFixed(this._receiveAmountDecimalPlaces)
      .toString()

    this.store.dispatch(this.commonActions.setActiveRouteId(routeId))

    this.store.dispatch(
      this.baseActions.setBridgeDetails({
        gas: `${Number(totalGasFeesInUsd ?? 0)
          .toFixed(2)
          .toString()}$`,
        estimateTime: executionDuration ? `${(executionDuration / 60).toFixed(0).toString()} min` : undefined,
        receiveAmount: formattedToAmount,
        requestId,
      })
    )

    // const { toAmount, serviceTime, totalGasFeesInUsd, routeId }

    // return {} as Promise<void>
  }
  public triggerBridging = () => undefined
  public validate = () => undefined
}
