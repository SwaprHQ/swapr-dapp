import { formatUnits } from '@ethersproject/units'
import { ChainId, Currency, WETH } from '@swapr/sdk'

import { DAI, MATIC, SOCKET_NATIVE_TOKEN_ADDRESS } from '../../../constants'
import { SupportedChainsConfig } from '../EcoBridge.types'
import { Route, TokenPriceResponseDTO } from './api/generated'
import { isFee, SocketWrapDirection } from './Socket.types'

const OVERRIDES = [
  {
    chainPair: [ChainId.MAINNET, ChainId.XDAI],
    BNativeWrapperAddressOnA: DAI[ChainId.MAINNET]?.address ?? '',
    ANativeWrapperAddressOnB: WETH[ChainId.XDAI]?.address ?? '',
  },
  {
    chainPair: [ChainId.MAINNET, ChainId.POLYGON],
    BNativeWrapperAddressOnA: MATIC[ChainId.MAINNET]?.address ?? '',
    ANativeWrapperAddressOnB: WETH[ChainId.POLYGON]?.address ?? '',
  },
  {
    chainPair: [ChainId.XDAI, ChainId.ARBITRUM_ONE],
    BNativeWrapperAddressOnA: WETH[ChainId.XDAI]?.address ?? '',
    ANativeWrapperAddressOnB: DAI[ChainId.ARBITRUM_ONE]?.address ?? '',
  },
  {
    chainPair: [ChainId.XDAI, ChainId.POLYGON],
    BNativeWrapperAddressOnA: MATIC[ChainId.XDAI]?.address ?? '',
    ANativeWrapperAddressOnB: DAI[ChainId.POLYGON]?.address ?? '',
  },
  {
    chainPair: [ChainId.POLYGON, ChainId.ARBITRUM_ONE],
    BNativeWrapperAddressOnA: WETH[ChainId.POLYGON]?.address ?? '',
    ANativeWrapperAddressOnB: MATIC[ChainId.ARBITRUM_ONE]?.address ?? '',
  },
]

export const getBestRoute = (routes: Route[], tokenData?: TokenPriceResponseDTO, toTokenDecimals?: number) => {
  if (routes.length === 1 || !tokenData || !toTokenDecimals || typeof tokenData.result.tokenPrice !== 'number')
    return routes[0]

  const {
    result: { tokenPrice },
  } = tokenData

  const bestRoute = routes.reduce<{ amount: number; routeId: string }>(
    (total, txRoute) => {
      if (tokenData?.success) {
        const amount =
          Number(formatUnits(txRoute.toAmount, toTokenDecimals).toString()) * tokenPrice - txRoute.totalGasFeesInUsd

        const route = {
          amount: Number(amount),
          routeId: txRoute.routeId,
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

  if (indexOfBestRoute === -1) return undefined

  return routes[indexOfBestRoute]
}

export const getBridgeFee = (userTxs: any, fromAsset: { amount: string; decimals?: number }): string => {
  if (isFee(userTxs)) {
    const [singleTxBridge] = userTxs

    //get protocolFee for each step
    const totalStepsFee = singleTxBridge.steps.reduce((total, step) => {
      if (!step.protocolFees.asset || step.protocolFees.amount === '0') {
        return total
      }
      total += Number(formatUnits(step.protocolFees.amount, step.protocolFees.asset.decimals))
      return total
    }, 0)

    const { amount, decimals } = fromAsset
    const formattedValue = Number(formatUnits(amount, decimals))

    //fee is incorrect (socket)
    const fee = (totalStepsFee / formattedValue) * 100

    return `${fee.toFixed(2).toString()}%`
  }

  //this shouldn't happen
  return '---'
}

export const getStatusOfResponse = (e: any) => {
  //e.code 20 is status of aborted request
  if (e.code === 20) return true

  return false
}

const getOverridesForChainPair = ({
  fromAddress,
  fromNativeCurrency,
  chainA,
  chainB,
  ANativeWrapperAddressOnB,
  fromChainId,
  toChainId,
  BNativeWrapperAddressOnA,
}: {
  fromNativeCurrency: Currency
  fromAddress: string
  chainA: ChainId
  chainB: ChainId
  fromChainId: ChainId
  ANativeWrapperAddressOnB: string
  toChainId: ChainId
  BNativeWrapperAddressOnA: string
}) => {
  // Ex: A - Mainnet B - Gnosis
  const supportedPair = [chainA, chainB]

  if (!(supportedPair.includes(fromChainId) && supportedPair.includes(toChainId))) return undefined

  const getWrapDirection = () => {
    // Ex: Mainnet ETH => WETH Gnosis
    if (toChainId === chainB && fromAddress === fromNativeCurrency.symbol?.toLowerCase())
      return SocketWrapDirection.FROM_A_NATIVE_TO_B_WRAPPED

    // Ex: Gnosis WETH => ETH Mainnet
    if (fromChainId === chainB && fromAddress === ANativeWrapperAddressOnB.toLowerCase())
      return SocketWrapDirection.FROM_B_WRAPPED_TO_A_NATIVE

    // Ex: Gnosis XDAI => Mainnet DAI
    if (fromChainId === chainB && fromAddress === fromNativeCurrency.symbol?.toLowerCase())
      return SocketWrapDirection.FROM_B_NATIVE_TO_A_WRAPPED

    // Ex: Mainnet DAI => XDAI Gnosis
    if (toChainId === chainB && BNativeWrapperAddressOnA.toLowerCase() === fromAddress.toLowerCase())
      return SocketWrapDirection.FROM_A_WRAPPED_TO_B_NATIVE

    return undefined
  }

  const wrapDirection = getWrapDirection()

  if (!wrapDirection) return

  const wrapDirectionMap = {
    [SocketWrapDirection.FROM_A_NATIVE_TO_B_WRAPPED]: {
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: ANativeWrapperAddressOnB,
    },
    [SocketWrapDirection.FROM_B_WRAPPED_TO_A_NATIVE]: {
      fromTokenAddressOverride: ANativeWrapperAddressOnB,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    },
    [SocketWrapDirection.FROM_B_NATIVE_TO_A_WRAPPED]: {
      fromTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
      toTokenAddressOverride: BNativeWrapperAddressOnA,
    },
    [SocketWrapDirection.FROM_A_WRAPPED_TO_B_NATIVE]: {
      fromTokenAddressOverride: BNativeWrapperAddressOnA,
      toTokenAddressOverride: SOCKET_NATIVE_TOKEN_ADDRESS,
    },
  }

  return wrapDirectionMap[wrapDirection]
}

export const overrideTokensAddresses = ({
  toChainId,
  fromChainId,
  fromAddress,
}: {
  toChainId: ChainId
  fromChainId: ChainId
  fromAddress: string
}) => {
  // No need to substitute on mainnet-arbitrum

  const resolvedOverride = OVERRIDES.find(
    ({ chainPair }) => chainPair.includes(fromChainId) && chainPair.includes(toChainId)
  )

  if (!resolvedOverride) return

  const { ANativeWrapperAddressOnB, BNativeWrapperAddressOnA, chainPair } = resolvedOverride
  const [chainA, chainB] = chainPair

  return getOverridesForChainPair({
    toChainId,
    fromChainId,
    fromAddress: fromAddress.toLowerCase(),
    fromNativeCurrency: Currency.getNative(fromChainId),
    chainA,
    chainB,
    BNativeWrapperAddressOnA,
    ANativeWrapperAddressOnB,
  })
}

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
}

export const SOCKET_LISTS_URL =
  'https://raw.githubusercontent.com/SwaprDAO/swapr-ecobridge-socket-lists/master/lists/socketList-bidirectional.json'

// Pairs all provided chains
export const socketSupportedChains = (supportedChains: ChainId[]) =>
  supportedChains
    .flatMap((v, i) => supportedChains.slice(i + 1).map(w => [v, w]))
    .map<SupportedChainsConfig>(([from, to]) => ({
      from,
      to,
    }))
