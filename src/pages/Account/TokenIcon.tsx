import { Box } from 'rebass'

import { getTokenLogoURL } from '../../components/CurrencyLogo/CurrencyLogo.utils'
import { useListsByToken } from '../../state/lists/hooks'
import { StyledLogo } from './Account.styles'
import { getTokenURLWithNetwork } from './accountUtils'

interface TokenIconProps {
  symbol: string
  width?: number
  height?: number
  marginRight?: number
}
export function TokenIcon({ symbol, width = 32, height = 32, marginRight = 6 }: TokenIconProps) {
  const allTokens = useListsByToken()

  const token = allTokens.get(symbol)
  const sources = [getTokenURLWithNetwork(symbol, token?.logoURI)]
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
