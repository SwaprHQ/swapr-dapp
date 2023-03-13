import { ChainId, Currency, DXD, SWPR, Token } from '@swapr/sdk'

import { useMemo } from 'react'
import styled from 'styled-components'

import carrotListLogoUrl from '../../../assets/images/carrot.png'
import DXDLogo from '../../../assets/images/dxd.svg'
import SWPRLogo from '../../../assets/images/swpr-logo.png'
import { CurrencyWrapperSource } from '../../../components/CurrencyLogo'
import { getTokenLogoURL, NATIVE_CURRENCY_LOGO } from '../../../components/CurrencyLogo/CurrencyLogo.utils'
import Logo from '../../../components/Logo'
import { useActiveWeb3React } from '../../../hooks'
import useHttpLocations from '../../../hooks/useHttpLocations'
import { useBridgeTokenInfo } from '../../../services/EcoBridge/EcoBridge.hooks'
import { useTokenInfoFromActiveListOnCurrentChain } from '../../../state/lists/hooks'
import { WrappedTokenInfo } from '../../../state/lists/wrapped-token-info'

type CurrencyLogoProps = {
  currency?: Currency
  currencyWrapperSource?: CurrencyWrapperSource
}

export function CurrencyLogo({ currency, currencyWrapperSource = CurrencyWrapperSource.SWAP }: CurrencyLogoProps) {
  // TODO: MIRKO CHECK THIS LOGIC!!!
  const { chainId } = useActiveWeb3React()
  const selectedChainId = chainId

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

    if (!currency || !currency.address) {
      return uriLocations
    }
    return [getTokenLogoURL(currency.address, selectedChainId), ...uriLocations]
  }, [currency, nativeCurrencyLogo, selectedChainId, uriLocations])

  return (
    <StyledLogo alt={`${currency?.symbol ?? 'token'} logo`} sources={sources} defaultText={currency?.symbol || '?'} />
  )
}

const StyledLogo = styled(Logo)`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`
