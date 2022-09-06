import { Text } from 'rebass'
import { useTheme } from 'styled-components'

import { ChartData } from '../../hooks/usePairTokenPriceByTimestamp'

const PricePercentualDifference = ({ data }: { data: ChartData[] }) => {
  const theme = useTheme()

  const firstPrice = parseFloat(data[0].value)
  const lastPrice = parseFloat(data[data.length - 1].value)
  const pricePercentualDifference = (((lastPrice - firstPrice) / firstPrice) * 100).toPrecision(3)

  const isPricePercentualDifferencePositive = parseFloat(pricePercentualDifference) > 0
  const isPricePercentualDifferenceZero = parseFloat(pricePercentualDifference) === 0

  const greenOrRed = isPricePercentualDifferencePositive ? theme.green1 : theme.red1
  const correctColor = isPricePercentualDifferenceZero ? theme.gray1 : greenOrRed
  const plusOrMinus = isPricePercentualDifferencePositive ? '+' : '-'
  const correctOperator = isPricePercentualDifferenceZero ? ' ' : plusOrMinus

  const showPricePercentualDifference = isPricePercentualDifferenceZero
    ? '0%'
    : `${Math.abs(parseFloat(pricePercentualDifference))}%`

  return (
    <Text fontSize="12px" color={correctColor} ml={2} fontWeight="600">
      {correctOperator}
      {showPricePercentualDifference}
    </Text>
  )
}

export default PricePercentualDifference
