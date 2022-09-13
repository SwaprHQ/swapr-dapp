import { Box, Flex } from 'rebass'

import { TYPE } from '../../theme/index'
import { PercentualDifferenceText } from '../PercentualDifference/PercentualDifferenceText'
import { ChartData, formatDate, formatPrice, lastElementValueOrDefault } from './chartUtils'
import { useChart } from './useChart'

type AreaChartTokenPriceProps = {
  data: ChartData[]
  tokenSymbol?: string
  showHours?: boolean
}

export const AreaChartTokenPrice = ({ data, tokenSymbol, showHours }: AreaChartTokenPriceProps) => {
  const { price, date, chartRef } = useChart({ data, showHours })

  const tokenPriceWithSymbol = `${formatPrice(price)} ${tokenSymbol}`

  return (
    <Flex flexDirection="column" alignItems="center" width="100%">
      <Box width="100%">
        <TYPE.DarkGray fontWeight={600} fontSize={30}>
          {tokenPriceWithSymbol}
        </TYPE.DarkGray>
        <Flex alignItems="center" mt="4px">
          <TYPE.Main fontSize={12} color="text4">
            {formatDate(date)}
          </TYPE.Main>
          <PercentualDifferenceText firstValue={data[0].value} lastValue={lastElementValueOrDefault(data)} />
        </Flex>
      </Box>
      <div ref={chartRef} />
    </Flex>
  )
}
