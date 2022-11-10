import { Text } from 'rebass'
import { useTheme } from 'styled-components'

import { PercentualDifference } from './percentualDifference'

type PricePercentualDifferenceProps = { firstValue: string; lastValue: string; fontsize?: string }

export const PercentualDifferenceText = ({
  firstValue,
  lastValue,
  fontsize = '12px',
}: PricePercentualDifferenceProps) => {
  const theme = useTheme()
  const PricePercentualDifference = new PercentualDifference(+firstValue, +lastValue, theme)

  return (
    <Text fontSize={fontsize} color={PricePercentualDifference.color()} ml={2} fontWeight="600">
      {PricePercentualDifference.format()}
    </Text>
  )
}
