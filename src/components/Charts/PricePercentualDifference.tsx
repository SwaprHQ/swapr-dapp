import { Text } from 'rebass'
import { useTheme } from 'styled-components'

type PricePercentualDifferenceProps = { firstValue: string; lastValue: string }

export const PricePercentualDifference = ({ firstValue, lastValue }: PricePercentualDifferenceProps) => {
  const theme = useTheme()

  const firstPrice = parseFloat(firstValue)
  const lastPrice = parseFloat(lastValue)
  const pricePercentualDifference = parseFloat((((lastPrice - firstPrice) / firstPrice) * 100).toPrecision(3))

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
