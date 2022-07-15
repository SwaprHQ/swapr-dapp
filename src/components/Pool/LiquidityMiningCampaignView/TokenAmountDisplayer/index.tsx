import { PricedToken, PricedTokenAmount } from '@swapr/sdk'

import { Box, Flex } from 'rebass'
import { useTheme } from 'styled-components'

import { useNativeCurrencyUSDPrice } from '../../../../hooks/useNativeCurrencyUSDPrice'
import { TYPE } from '../../../../theme'
import { AutoColumn } from '../../../Column'
import { CurrencyLogo } from '../../../CurrencyLogo'
import { AutoRow } from '../../../Row'
import { MouseoverTooltip } from '../../../Tooltip'

interface TokenAmountDisplayerProps {
  amount: PricedTokenAmount
  fontSize?: string
  alignRight?: boolean
  showUSDValue: boolean
  className?: string
}

function TokenAmountDisplayer({
  amount,
  fontSize = '14px',
  alignRight,
  showUSDValue,
  className,
}: TokenAmountDisplayerProps) {
  const theme = useTheme()
  const { nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()

  const tooltipIcons = (token: PricedToken) => {
    return (
      <AutoRow>
        <CurrencyLogo currency={token} size={'22px'} />
        <AutoColumn style={{ marginLeft: '4px' }}>
          <TYPE.White>{token.symbol}</TYPE.White>
          <TYPE.Body fontWeight={600} fontSize={9}>
            {token.name}
          </TYPE.Body>
        </AutoColumn>
      </AutoRow>
    )
  }

  return (
    <Flex justifyContent={alignRight ? 'flex-end' : 'flex-start'} alignItems="center" className={className} mb="2px">
      <MouseoverTooltip
        styled={{
          border: 'none',
          borderRadius: '4px',
          backgroundColor: theme.bg3,
        }}
        content={tooltipIcons(amount.token)}
      >
        <Flex alignItems="center">
          <Box mr="4px">
            <TYPE.Small fontWeight="500" fontSize={fontSize} color="text3">
              {showUSDValue
                ? `$${amount.nativeCurrencyAmount.multiply(nativeCurrencyUSDPrice).toSignificant(4)}`
                : amount.toSignificant(4)}
            </TYPE.Small>
          </Box>
          {!showUSDValue && (
            <Box mr="4px">
              <CurrencyLogo currency={amount.token} size={fontSize} />
            </Box>
          )}
        </Flex>
      </MouseoverTooltip>
    </Flex>
  )
}

export default TokenAmountDisplayer
