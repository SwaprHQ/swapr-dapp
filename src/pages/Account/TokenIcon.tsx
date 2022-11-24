import { ChainId, DXD, SWPR, WETH } from '@swapr/sdk'

import { Box } from 'rebass'

import DXDLogo from '../../assets/images/dxd.svg'
import SWPRLogo from '../../assets/images/swpr-logo.png'
import { getTokenLogoURL, NATIVE_CURRENCY_LOGO } from '../../components/CurrencyLogo/CurrencyLogo.utils'
import { ZERO_ADDRESS } from '../../constants'
import { useListsByAddress, useListsByToken } from '../../state/lists/hooks'
import { StyledLogo } from './Account.styles'
import { getNetworkDefaultTokenUrl } from './utils/accountUtils'

interface TokenIconProps {
  symbol?: string
  address?: string
  chainId?: ChainId
  width?: number
  height?: number
  marginRight?: number
}
export function TokenIcon({ symbol, address, chainId, width = 32, height = 32, marginRight = 6 }: TokenIconProps) {
  const allTokensBySymbol = useListsByToken()
  const allTokensByAddress = useListsByAddress()
  let token = symbol ? allTokensBySymbol.get(symbol) : undefined
  if (!token && address && chainId) {
    token = allTokensByAddress.get(chainId)?.get(address) ?? allTokensByAddress.get(ChainId.MAINNET)?.get(address)
  }

  let sources: string[] = []

  if (address === ZERO_ADDRESS) {
    sources.push(NATIVE_CURRENCY_LOGO[chainId ?? ChainId.MAINNET])
  }

  if (chainId && DXD[chainId]?.address === address) {
    sources = [DXDLogo]
  }

  if (chainId && SWPR[chainId]?.address === address) {
    sources = [SWPRLogo]
  }

  if (address) {
    sources.push(getTokenLogoURL(address, chainId))
  }
  if (token?.symbol) {
    const urlSource = getNetworkDefaultTokenUrl(token.symbol, token?.logoURI)
    if (urlSource) {
      if (token?.symbol === WETH[ChainId.MAINNET].symbol) {
        sources.push(getTokenLogoURL(WETH[ChainId.MAINNET].address, ChainId.MAINNET))
      } else {
        sources.push(urlSource)
      }
    }
  }

  if (token) {
    sources.push(getTokenLogoURL(token.address))
  }

  return (
    <Box sx={{ width: `${width}px`, height: `${height}px`, marginRight: `${marginRight}px`, position: 'relative' }}>
      <Box
        sx={{
          width: `${width - 2}px`,
          height: `${height - 2}px`,
          position: 'absolute',
          backgroundColor: '#fff',
          left: '1px',
          top: '1px',
          borderRadius: '50%',
        }}
      ></Box>
      <StyledLogo
        alt={`${symbol ?? 'token'} logo`}
        size={`${width}px`}
        style={{ position: 'absolute' }}
        sources={sources}
        defaultText={symbol ?? '?'}
      />
    </Box>
  )
}
