import { Pair } from '@swapr/sdk'

import React from 'react'
import { ExternalLink as ExternalLinkIcon } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { DATE_INTERVALS, usePairTokenPriceByTimestamp } from '../../hooks/usePairTokenPriceByTimestamp'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { Field } from '../../state/swap/types'
import { ExternalLink, TYPE } from '../../theme'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import DoubleCurrencyLogo from '../DoubleLogo'
import { DimBlurBgBox } from '../Pool/DimBlurBgBox/styleds'
import TradingViewAreaChart from './TradingViewAreaChart'

export default function SimpleChart() {
  const { chainId } = useActiveWeb3React()
  const [selectedInterval, setSelectedInterval] = React.useState<string>(DATE_INTERVALS.DAY)
  const { currencies } = useDerivedSwapInfo()
  const currency0 = currencies[Field.INPUT]
  const currency1 = currencies[Field.OUTPUT]
  const theme = useTheme()

  const wrappedToken0 = wrappedCurrency(currency0, chainId)
  const wrappedToken1 = wrappedCurrency(currency1, chainId)
  const pairAddress = wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase()
  const statsLink = pairAddress
    ? `https://dxstats.eth.limo/#/pair/${pairAddress}?chainId=${chainId}`
    : `https://dxstats.eth.limo/#/pairs?chainId=${chainId}`

  const { data, loading, error } = usePairTokenPriceByTimestamp({
    currency0,
    currency1,
    dateInterval: selectedInterval,
  })

  return (
    <DimBlurBgBox height="400px" width="100%" py={3}>
      <Flex flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
        {currency0 && currency1 && (
          <Flex width="100%" justifyContent="space-between" px={3}>
            <PairExternalLink href={statsLink}>
              <Box mr="4px">
                <DoubleCurrencyLogo
                  loading={!currency0 || !currency1}
                  currency0={currency0 || undefined}
                  currency1={currency1 || undefined}
                  size={20}
                />
              </Box>
              <Flex alignItems="center">
                <Text fontWeight="600" fontSize="14px" color={theme.text2}>
                  {!currency0 || !currency1 ? <Skeleton width="69px" /> : `${currency0.symbol}/${currency1.symbol}`}
                </Text>
                <Box ml={2}>{currency0 && currency1 && <ExternalLinkIcon size={12} color={theme.text3} />}</Box>
              </Flex>
            </PairExternalLink>
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
        <Flex p={3} width="100%" height="100%" justifyContent="center" alignItems="center">
          {currency0 && currency1 ? (
            loading ? (
              <TYPE.DarkGray>Fetching new data...</TYPE.DarkGray>
            ) : data?.length > 0 ? (
              <TradingViewAreaChart data={data} />
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

const DateFilterButton = styled.button<{ active?: boolean }>`
  margin-left: 4px;
  padding: 10px 12px;
  height: fit-content;
  border: ${({ active }) => (active ? '1px solid #464366' : '1px solid transparent')};

  color: ${({ theme }) => theme.text4};
  font-size: 10px;
  text-transform: uppercase;

  background: ${({ active }) =>
    active
      ? 'linear-gradient(143.3deg,rgba(46,23,242,0.3) -185.11%,rgb(46 23 242 / 4%) 49.63%),linear-gradient(113.18deg,rgb(255 255 255 / 22%) -0.1%,rgb(0 0 0 / 18%) 98.9%),rgb(57 51 88 / 80%)'
      : 'transparent'};
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: ${({ active }) => (active ? ' blur(25px)' : '0')};
  border-radius: 12px;

  cursor: pointer;

  &:hover {
    background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.3) -185.11%, rgb(46 23 242 / 4%) 49.63%),
      linear-gradient(113.18deg, rgb(255 255 255 / 22%) -0.1%, rgb(0 0 0 / 18%) 98.9%), rgb(57 51 88 / 80%);
  }
`

const PairExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  border: solid 1px ${props => props.theme.bg3};
  border-radius: 8px;
  height: 36px;
  padding: 0 10px;
  cursor: pointer;
`
