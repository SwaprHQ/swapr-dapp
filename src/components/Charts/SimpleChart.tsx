import { Currency } from '@swapr/sdk'

import React, { useLayoutEffect } from 'react'
import { Repeat as RepeatIcon } from 'react-feather'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { DATE_INTERVALS, usePairTokenPriceByTimestamp } from '../../hooks/usePairTokenPriceByTimestamp'
import { TYPE } from '../../theme'
import { BlurBox } from '../../ui/StyledElements/BlurBox'
import { SimpleChartDateFilters } from './SimpleChartDateFilters'
import { SimpleChartLoading } from './SimpleChartLoading'
import TradingViewAreaChart from './TradingViewAreaChart'

export default function SimpleChart({ currency0, currency1 }: { currency0?: Currency; currency1?: Currency }) {
  const theme = useTheme()
  const [selectedInterval, setSelectedInterval] = React.useState<string>(DATE_INTERVALS.DAY)
  const [isCurrenciesSwitched, setIsCurrenciesSwitched] = React.useState(false)

  useLayoutEffect(() => setIsCurrenciesSwitched(false), [currency0, currency1])

  const currencies = isCurrenciesSwitched ? { currency0: currency1, currency1: currency0 } : { currency0, currency1 }

  const { data, loading } = usePairTokenPriceByTimestamp({
    currency0: currencies.currency0,
    currency1: currencies.currency1,
    dateInterval: selectedInterval,
  })

  return (
    <BlurBox minHeight="312px" width="100%" p={3}>
      <Flex flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
        {currency0 && currency1 && (
          <Flex width="100%" justifyContent="space-between" mb={2}>
            <PairSwitcher
              alignItems="center"
              color={theme.text5}
              onClick={() => setIsCurrenciesSwitched(!isCurrenciesSwitched)}
            >
              <Text fontSize="12px" fontWeight={600}>
                {currencies.currency0?.symbol}/{currencies.currency1?.symbol}
              </Text>
              <Box ml={1}>
                <RepeatIcon size="12" />
              </Box>
            </PairSwitcher>
            <SimpleChartDateFilters setInterval={setSelectedInterval} selectedInterval={selectedInterval} />
          </Flex>
        )}
        <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
          {currency0 && currency1 ? (
            loading ? (
              <SimpleChartLoading />
            ) : data && data.length > 0 ? (
              <TradingViewAreaChart data={data} tokenSymbol={currencies.currency1?.symbol} />
            ) : (
              <TYPE.DarkGray>Sorry, this pair doesn't have enough data.</TYPE.DarkGray>
            )
          ) : (
            <TYPE.DarkGray>Select token</TYPE.DarkGray>
          )}
        </Flex>
      </Flex>
    </BlurBox>
  )
}

const PairSwitcher = styled(Flex)`
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text4};
  }
`
