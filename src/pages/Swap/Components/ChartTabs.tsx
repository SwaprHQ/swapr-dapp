import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { useIsDesktop } from '../../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../../hooks/useRouter'
import { ChartOptions } from '../../../state/user/reducer'

export const ChartTabs = ({
  activeChartTab,
  setActiveChartTab,
}: {
  activeChartTab: ChartOptions
  setActiveChartTab: (tab: ChartOptions) => void
}) => {
  const { navigate } = useRouter()
  const { t } = useTranslation('swap')
  const isDesktop = useIsDesktop()
  const proOptionsDisabled = !isDesktop

  return (
    <Root>
      {/* <Tab
        active={activeChartTab === ChartOptions.SIMPLE_CHART}
        onClick={() => {
          if (activeChartTab !== ChartOptions.SIMPLE_CHART) {
            setActiveChartTab(ChartOptions.SIMPLE_CHART)
            navigate('/swap')
          }
        }}
        title={t('advancedTradingView.chartTabs.simpleTitle')}
        disabled={!hasBothCurrenciesInput}
      >
        {t('advancedTradingView.chartTabs.simple')}
      </Tab> */}
      <Tab
        active={activeChartTab === ChartOptions.PRO}
        onClick={() => {
          if (activeChartTab !== ChartOptions.PRO) {
            setActiveChartTab(ChartOptions.PRO)
            navigate('/swap/pro')
          }
        }}
        title={
          // proOptionsDisabled
          //   ? t('advancedTradingView.chartTabs.proDisabledTitle'):
          t('advancedTradingView.chartTabs.proTitle')
        }
        disabled={proOptionsDisabled}
      >
        {t('advancedTradingView.chartTabs.pro')}
      </Tab>
      <Tab
        active={activeChartTab === ChartOptions.OFF}
        onClick={() => {
          setActiveChartTab(ChartOptions.OFF)
          navigate('/swap')
        }}
        title={t('advancedTradingView.chartTabs.offTitle')}
        disabled={proOptionsDisabled}
      >
        {t('advancedTradingView.chartTabs.off')}
      </Tab>
    </Root>
  )
}

const Root = styled(Flex)`
  background: ${({ theme }) => theme.dark1};
  border-radius: 12px;
  padding: 3px;
  > * {
    margin-right: 3px;
  }
`

export const Tab = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  padding: 8px;
  background: ${({ active, theme }) => (active ? theme.dark2 : theme.dark1)};
  border: 0;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? 'white' : theme.purple5)};
  text-transform: uppercase;
  cursor: pointer;
  &:last-child {
    margin: 0;
  }
  &:hover {
    color: ${({ theme }) => theme.text3};
    background: ${({ theme }) => theme.dark2};
  }
  &:disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.dark2};
    background: ${({ theme }) => theme.dark1};
  }
`
