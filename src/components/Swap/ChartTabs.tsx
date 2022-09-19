import { Flex } from 'rebass'
import styled from 'styled-components'

import { useIsDesktopByMedia } from '../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../hooks/useRouter'
import { ChartTabs as ChartTabsOptions } from '../../state/user/reducer'

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

export const ChartTabs = ({
  activeChartTab,
  setActiveChartTab,
  hasBothCurrenciesInput,
}: {
  activeChartTab: ChartTabsOptions
  setActiveChartTab: (tab: ChartTabsOptions) => void
  hasBothCurrenciesInput: boolean
}) => {
  const { navigate } = useRouter()
  const isDesktop = useIsDesktopByMedia()
  const proOptionsDisabled = !hasBothCurrenciesInput || !isDesktop

  return (
    <Root>
      <Tab
        active={activeChartTab === ChartTabsOptions.SIMPLE}
        onClick={() => {
          if (activeChartTab !== ChartTabsOptions.SIMPLE) {
            setActiveChartTab(ChartTabsOptions.SIMPLE)
            navigate('/swap')
          }
        }}
        title="Simple chart"
        disabled={!hasBothCurrenciesInput}
      >
        Simple
      </Tab>
      <Tab
        active={activeChartTab === ChartTabsOptions.PRO}
        onClick={() => {
          if (activeChartTab !== ChartTabsOptions.PRO) {
            setActiveChartTab(ChartTabsOptions.PRO)
            navigate('/swap/pro')
          }
        }}
        title={`Advanced Trade View${proOptionsDisabled && ' is disabled on mobile, try desktop version'}`}
        disabled={proOptionsDisabled}
      >
        Pro
      </Tab>
      <Tab
        active={activeChartTab === ChartTabsOptions.OFF}
        onClick={() => {
          if (activeChartTab !== ChartTabsOptions.OFF) {
            setActiveChartTab(ChartTabsOptions.OFF)
            navigate('/swap')
          }
        }}
        title="Switch off charts"
        disabled={!hasBothCurrenciesInput}
      >
        Off
      </Tab>
    </Root>
  )
}
