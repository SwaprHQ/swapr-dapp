import { Currency } from '@swapr/sdk'

import React, { useLayoutEffect } from 'react'
import { Repeat as RepeatIcon } from 'react-feather'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { DATE_INTERVALS, usePairTokenPriceByTimestamp } from '../../hooks/usePairTokenPriceByTimestamp'
import { TYPE } from '../../theme'
import { DimBlurBgBox } from '../Pool/DimBlurBgBox/styleds'
import TradingViewAreaChart from './TradingViewAreaChart'

export default function SimpleChart({ currency0, currency1 }: { currency0?: Currency; currency1?: Currency }) {
  const theme = useTheme()
  const [selectedInterval, setSelectedInterval] = React.useState<string>(DATE_INTERVALS.DAY)
  const [isTokenSwitched, setIsTokenSwitched] = React.useState(false)

  useLayoutEffect(() => setIsTokenSwitched(false), [currency0, currency1])

  const { data, loading, error } = usePairTokenPriceByTimestamp({
    currency0: isTokenSwitched ? currency1 : currency0,
    currency1: isTokenSwitched ? currency0 : currency1,
    dateInterval: selectedInterval,
  })

  const pairAddressText = (currency0: Currency, currency1: Currency) =>
    isTokenSwitched ? `${currency0.symbol}/${currency1.symbol}` : `${currency1.symbol}/${currency0.symbol}`

  return (
    <DimBlurBgBox height="400px" width="100%" p={3}>
      <Flex flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
        {currency0 && currency1 && (
          <Flex width="100%" justifyContent="space-between">
            <PairSwitcher alignItems="center" color={theme.text5} onClick={() => setIsTokenSwitched(!isTokenSwitched)}>
              <Text fontSize="12px" fontWeight={600}>
                {pairAddressText(currency0, currency1)}
              </Text>
              <Box ml={1}>
                <RepeatIcon size="12" />
              </Box>
            </PairSwitcher>
            <Flex>
              <DateFilterButton
                active={selectedInterval === DATE_INTERVALS.DAY}
                onClick={() => setSelectedInterval(DATE_INTERVALS.DAY)}
              >
                1d
              </DateFilterButton>
              <DateFilterButton
                active={selectedInterval === DATE_INTERVALS.WEEK}
                onClick={() => setSelectedInterval(DATE_INTERVALS.WEEK)}
              >
                1w
              </DateFilterButton>
              <DateFilterButton
                active={selectedInterval === DATE_INTERVALS.MONTH}
                onClick={() => setSelectedInterval(DATE_INTERVALS.MONTH)}
              >
                1m
              </DateFilterButton>
              <DateFilterButton
                active={selectedInterval === DATE_INTERVALS.YEAR}
                onClick={() => setSelectedInterval(DATE_INTERVALS.YEAR)}
              >
                1y
              </DateFilterButton>
            </Flex>
          </Flex>
        )}
        <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
          {currency0 && currency1 ? (
            loading ? (
              <TYPE.DarkGray>Fetching new data...</TYPE.DarkGray>
            ) : data?.length > 0 ? (
              <TradingViewAreaChart data={data} tokenSymbol={isTokenSwitched ? currency1.symbol : currency0.symbol} />
            ) : (
              <TYPE.DarkGray>Sorry, this pair doesn't have enough data.</TYPE.DarkGray>
            )
          ) : (
            <TYPE.DarkGray>Select token</TYPE.DarkGray>
          )}
        </Flex>
      </Flex>
    </DimBlurBgBox>
  )
}

const PairSwitcher = styled(Flex)`
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text4};
  }
`

const DateFilterButton = styled.button<{ active?: boolean }>`
  margin-left: 4px;
  padding: 8px 10px;
  height: fit-content;
  border: none;

  color: ${({ theme, active }) => (active ? theme.white : theme.text4)};
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  background: transparent;

  cursor: pointer;

  &:hover {
    color: white;
  }
`
