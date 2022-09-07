import { Text } from 'rebass'
import { useTheme } from 'styled-components'

import { ChartData, lastDataElement } from './simpleChartUtils'

export const PricePercentualDifference = ({ data }: { data: ChartData[] }) => {
  const theme = useTheme()

  const originalPrice = parseFloat(data[0].value)
  const lastPrice = parseFloat(lastDataElement(data).value)
  const pricePercentualDifference = parseFloat((((lastPrice - originalPrice) / originalPrice) * 100).toPrecision(3))

  const isPricePercentualDifferencePositive = pricePercentualDifference > 0
  const isPricePercentualDifferenceZero = pricePercentualDifference === 0

  const greenOrRed = isPricePercentualDifferencePositive ? theme.green1 : theme.red1
  const textColor = isPricePercentualDifferenceZero ? theme.gray1 : greenOrRed
  const plusOrMinusSign = isPricePercentualDifferencePositive ? '+' : '-'
  const sign = isPricePercentualDifferenceZero ? ' ' : plusOrMinusSign

  return (
    <Text fontSize="12px" color={textColor} ml={2} fontWeight="600">
      {sign}
      {Math.abs(pricePercentualDifference)}%
    </Text>
  )
}
