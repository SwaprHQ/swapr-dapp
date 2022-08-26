import React from 'react'
import { ChevronDown } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import {
  DATE_INTERVALS,
  DATE_INTERVALS_IN_TIMESTAMP,
  usePairTokenPriceByTimestamp,
} from '../../hooks/usePairTokenPriceByTimestamp'
import SimpleChart from '../../pages/Swap/SimpleChart'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { Field } from '../../state/swap/types'
import { ButtonGrey } from '../Button'
import DoubleCurrencyLogo from '../DoubleLogo'
import { DimBlurBgBox } from '../Pool/DimBlurBgBox/styleds'

export default function SimpleSimpleChart() {
  const [selectedInterval, setSelectedInterval] = React.useState<number>(DATE_INTERVALS.DAY)

  const { currencies } = useDerivedSwapInfo()
  const currency0 = currencies[Field.INPUT]
  const currency1 = currencies[Field.OUTPUT]

  const { data, loading, error } = usePairTokenPriceByTimestamp({
    currency0,
    currency1,
    timestamp: DATE_INTERVALS_IN_TIMESTAMP[selectedInterval],
    timeframe: selectedInterval,
  })

  console.log({
    currency0,
    currency1,
    timestamp: DATE_INTERVALS_IN_TIMESTAMP[selectedInterval],
    loading,
    data,
    error,
  })

  return (
    <Box ml={[0, 3]} mt={[3, 0]}>
      <DimBlurBgBox height="400px" width={['100%', '550px']} py={3}>
        <Flex flexDirection="column" width="100%" justifyContent="center" alignItems="center">
          <Flex width="100%" justifyContent="space-between" px={3}>
            <PointableFlex onClick={() => {}}>
              <Box mr="4px">
                <DoubleCurrencyLogo
                  loading={!currency0 || !currency1}
                  currency0={currency0 || undefined}
                  currency1={currency1 || undefined}
                  size={20}
                />
              </Box>
              <Box mr="4px">
                <Text fontWeight="600" fontSize="16px" lineHeight="20px">
                  {!currency0 || !currency1 ? <Skeleton width="60px" /> : `${currency0.symbol}/${currency1.symbol}`}
                </Text>
              </Box>
              <Box>
                <ChevronDown size={12} />
              </Box>
            </PointableFlex>
            <Flex>
              <ButtonGrey ml={2} mb="10px" onClick={() => setSelectedInterval(DATE_INTERVALS.DAY)}>
                1d
              </ButtonGrey>
              <ButtonGrey ml={2} mb="10px" onClick={() => setSelectedInterval(DATE_INTERVALS.WEEK)}>
                1w
              </ButtonGrey>
              <ButtonGrey ml={2} mb="10px" onClick={() => setSelectedInterval(DATE_INTERVALS.MONTH)}>
                1m
              </ButtonGrey>
              <ButtonGrey ml={2} mb="10px" onClick={() => setSelectedInterval(DATE_INTERVALS.YEAR)}>
                1y
              </ButtonGrey>
            </Flex>
          </Flex>
          <Box p={3} width="100%">
            {currency0 && currency1 ? (
              loading ? (
                'Loading'
              ) : data ? (
                <SimpleChart data={data} />
              ) : (
                'No data'
              )
            ) : (
              'Choose token pair'
            )}
          </Box>
        </Flex>
      </DimBlurBgBox>
    </Box>
  )
}

const PointableFlex = styled(Flex)`
  border: solid 1px ${props => props.theme.bg3};
  border-radius: 8px;
  height: 36px;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
`
