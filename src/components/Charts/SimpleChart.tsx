import { Currency } from '@swapr/sdk'

import React from 'react'
import { Repeat as RepeatIcon } from 'react-feather'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { TYPE } from '../../theme'
import { BlurBox } from '../../ui/StyledElements/BlurBox'
import { SimpleChartDateFilters } from './SimpleChartDateFilters'
import { SimpleChartLoading } from './SimpleChartLoading'
import { ChartData, DATE_INTERVALS } from './simpleChartUtils'
import TradingViewAreaChart from './TradingViewAreaChart'

export function SimpleChart({
  data,
  loading,
  currency0,
  currency1,
  selectedInterval,
  setSelectedInterval,
  isCurrenciesSwitched,
  setIsCurrenciesSwitched,
}: {
  data: ChartData[]
  loading: boolean
  currency0?: Currency
  currency1?: Currency
  selectedInterval: string
  isCurrenciesSwitched: boolean
  setIsCurrenciesSwitched: Function
  setSelectedInterval: Function
}) {
  const theme = useTheme()

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
                {currency0?.symbol}/{currency1?.symbol}
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
              <TradingViewAreaChart
                data={data}
                tokenSymbol={currency1?.symbol}
                showHours={selectedInterval === DATE_INTERVALS.DAY}
              />
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
