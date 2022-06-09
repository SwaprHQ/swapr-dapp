import { ChainId, Currency, DXD, SWPR, Token } from '@swapr/sdk'

import React, { useMemo } from 'react'

import carrotListLogoUrl from '../../assets/images/carrot.png'
import SWPRLogo from '../../assets/images/swpr-logo.png'
import DXDLogo from '../../assets/svg/dxd.svg'
import { useActiveWeb3React } from '../../hooks'
import useHttpLocations from '../../hooks/useHttpLocations'
import { useBridgeTokenInfo } from '../../services/EcoBridge/EcoBridge.hooks'
import { useTokenInfoFromActiveListOnCurrentChain } from '../../state/lists/hooks'
import { WrappedTokenInfo } from '../../state/lists/wrapped-token-info'
import { CurrencyLogoComponent } from './CurrencyLogo.component'
import { CurrencyLogoContainerProps, CurrencyWrapperSource } from './CurrencyLogo.types'
import { getTokenLogoURL, NATIVE_CURRENCY_LOGO } from './CurrencyLogo.utils'

export const CurrencyLogo = ({
  currency,
  chainIdOverride,
  currencyWrapperSource = CurrencyWrapperSource.SWAP,
  ...componentProps
}: CurrencyLogoContainerProps) => {
  const { chainId } = useActiveWeb3React()
  const selectedChainId = chainIdOverride || chainId

  const swapWrappedTokenInfo = useTokenInfoFromActiveListOnCurrentChain(currency)
  const bridgeWrappedTokenInfo = useBridgeTokenInfo(currency, selectedChainId)
  const resolvedWrappedTokenInfo =
    currencyWrapperSource === CurrencyWrapperSource.SWAP ? swapWrappedTokenInfo : bridgeWrappedTokenInfo

  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo
      ? currency.logoURI
      : resolvedWrappedTokenInfo
      ? resolvedWrappedTokenInfo.logoURI
      : undefined
  )

  const nativeCurrencyLogo = NATIVE_CURRENCY_LOGO[(selectedChainId as ChainId) || ChainId.MAINNET]

  const sources: string[] = useMemo(() => {
    if (currency && Currency.isNative(currency) && !!nativeCurrencyLogo) return [nativeCurrencyLogo]
    if (currency instanceof Token) {
      if (Token.isNativeWrapper(currency)) return [nativeCurrencyLogo]
      if (selectedChainId && DXD[selectedChainId] && DXD[selectedChainId].address === currency.address) return [DXDLogo]
      if (selectedChainId && SWPR[selectedChainId] && SWPR[selectedChainId].address === currency.address)
        return [SWPRLogo]
      return [getTokenLogoURL(currency.address, selectedChainId), ...uriLocations]
    }

    if (currency instanceof Token)
      return [
        `${window.location.origin}${
          carrotListLogoUrl.startsWith('.') ? carrotListLogoUrl.substring(1) : carrotListLogoUrl
        }`,
      ]
    return []
  }, [currency, nativeCurrencyLogo, selectedChainId, uriLocations])

  return <CurrencyLogoComponent sources={sources} currency={currency} {...componentProps} />
}
