import { BarChart2 as Barchart2Icon } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Box } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { ChartOptions } from '../../pages/Swap/SwapContext'
import { ButtonGroup, ButtonGroupOption } from '../ButtonGroup/ButtonGroup'

interface ChartToggleProps {
  hasBothCurrenciesInput: boolean
  selectedChartOption: ChartOptions | undefined
  setselectedChartOption: Function
}

export function ChartToggle({ hasBothCurrenciesInput, setselectedChartOption, selectedChartOption }: ChartToggleProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <>
      {/* show on mobile */}
      <Box display={['block', 'none']}>
        <ToggleChartButton
          disabled={!hasBothCurrenciesInput}
          active={selectedChartOption === ChartOptions.SIMPLE_CHART}
          onClick={() =>
            setselectedChartOption(
              selectedChartOption === ChartOptions.OFF ? ChartOptions.SIMPLE_CHART : ChartOptions.OFF
            )
          }
        >
          <Barchart2Icon color={!hasBothCurrenciesInput ? theme.dark2 : theme.text4} />
        </ToggleChartButton>
      </Box>
      {/* show on desktop */}
      <Box display={['none', 'block']}>
        <ButtonGroup mb={[3, 0]}>
          <ButtonGroupOption
            disabled={!hasBothCurrenciesInput}
            active={selectedChartOption === ChartOptions.SIMPLE_CHART}
            onClick={() => setselectedChartOption(ChartOptions.SIMPLE_CHART)}
          >
            {t('chart')}
          </ButtonGroupOption>
          <ButtonGroupOption
            disabled={!hasBothCurrenciesInput}
            active={selectedChartOption === ChartOptions.OFF}
            onClick={() => setselectedChartOption(ChartOptions.OFF)}
          >
            {t('off')}
          </ButtonGroupOption>
        </ButtonGroup>
      </Box>
    </>
  )
}

const ToggleChartButton = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 8px;
  height: 32px;
  width: 32px;
  border: 1px solid ${({ active, theme }) => (active ? theme.text4 : 'transparent')};

  background: ${({ active, theme }) => (active ? theme.bg2 : theme.bg6)};
  color: ${({ active, theme }) => (active ? theme.white : theme.text2)};
  border-radius: 12px;
  cursor: pointer;

  &:disabled {
    border-color: transparent;
  }
`
