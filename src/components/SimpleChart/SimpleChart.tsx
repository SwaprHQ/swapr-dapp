import { Currency } from '@swapr/sdk'

import { Repeat as RepeatIcon } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { TYPE } from '../../theme'
import { BlurBox } from '../../ui/StyledElements/BlurBox'
import { AreaChartTokenPrice } from '../Charts/AreaChartTokenPrice'
import { ChartData, DATE_INTERVALS } from '../Charts/chartUtils'
import { SimpleChartDateFilters } from './SimpleChartDateFilters'
import { SimpleChartLoading } from './SimpleChartLoading'

interface SimpleChartProps {
  data: ChartData[]
  loading: boolean
  currency0?: Currency
  currency1?: Currency
  selectedInterval: string
  isCurrenciesSwitched: boolean
  setIsCurrenciesSwitched: Function
  setSelectedInterval: Function
}

export const SimpleChart = ({
  data,
  loading,
  currency0,
  currency1,
  selectedInterval,
  setSelectedInterval,
  isCurrenciesSwitched,
  setIsCurrenciesSwitched,
}: SimpleChartProps) => {
  const theme = useTheme()
  const { t } = useTranslation('simpleChart')

  const hasBothCurrencies = currency0 && currency1
  const pairSlashed = `${currency0?.symbol}/${currency1?.symbol}`
  const hasData = data && data.length > 0

  return (
    <BlurBox minHeight="312px" width="100%" p={3}>
      <Flex flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
        {hasBothCurrencies && (
          <Flex width="100%" justifyContent="space-between" mb={2}>
            <PairSwitcher
              alignItems="center"
              color={theme.text5}
              onClick={() => setIsCurrenciesSwitched(!isCurrenciesSwitched)}
            >
              <Text fontSize="12px" fontWeight={600}>
                {pairSlashed}
              </Text>
              <Box ml={1}>
                <RepeatIcon size="12" />
              </Box>
            </PairSwitcher>
            <SimpleChartDateFilters setInterval={setSelectedInterval} selectedInterval={selectedInterval} />
          </Flex>
        )}
        <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
          {hasBothCurrencies ? (
            loading ? (
              <SimpleChartLoading />
            ) : hasData ? (
              <AreaChartTokenPrice
                data={data}
                tokenSymbol={currency1?.symbol}
                showHours={selectedInterval === DATE_INTERVALS.DAY}
              />
            ) : (
              <TYPE.DarkGray>{t('pairNoData')}</TYPE.DarkGray>
            )
          ) : (
            <TYPE.DarkGray>{t('selectToken')}</TYPE.DarkGray>
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
