import { ChainId, DXD, SWPR } from '@swapr/sdk'

import { Box } from 'rebass'

import SWPRLogo from '../../assets/images/swpr-logo.png'
import DXDLogo from '../../assets/svg/dxd.svg'
import { getTokenLogoURL, NATIVE_CURRENCY_LOGO } from '../../components/CurrencyLogo/CurrencyLogo.utils'
import { useListsByToken } from '../../state/lists/hooks'
import { StyledLogo } from './Account.styles'
import { getTokenURLWithNetwork } from './accountUtils'

interface TokenIconProps {
  symbol: string
  address?: string
  chainId?: ChainId
  width?: number
  height?: number
  marginRight?: number
}
export function TokenIcon({ symbol, address, chainId, width = 32, height = 32, marginRight = 6 }: TokenIconProps) {
  const allTokens = useListsByToken()
  const token = allTokens.get(symbol)
  let sources: string[] = []

  if (address === '0x0000000000000000000000000000000000000000') {
    sources.push(NATIVE_CURRENCY_LOGO[chainId ?? ChainId.MAINNET])
  }

  if (chainId && DXD[chainId] && DXD[chainId].address === address) {
    sources = [DXDLogo]
  }

  if (chainId && SWPR[chainId] && SWPR[chainId].address === address) {
    sources = [SWPRLogo]
  }

  if (address) {
    sources.push(getTokenLogoURL(address, chainId))
  }

  const urlSource = getTokenURLWithNetwork(symbol, token?.logoURI)
  if (urlSource) {
    sources.push(urlSource)
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
