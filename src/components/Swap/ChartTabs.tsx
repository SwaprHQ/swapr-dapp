import { useNavigate } from 'react-router-dom'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ChartTabs as ChartTabsOptions } from '../../state/user/reducer'

const Root = styled(Flex)``

export const Tab = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: fit-content;
  font-size: 10px;
  font-weight: 600;
  color: ${({ active }) => (active ? '#EBE9F8' : '#464366')};
  cursor: pointer;
  background: ${({ active }) => (active ? 'rgba(104, 110, 148, 0.25)' : 'rgba(62, 65, 87, 0.2)')};
  border: 1px solid #2c2b42;
  &:hover {
    color: ${({ theme }) => theme.text4};
    background: rgba(104, 110, 148, 0.25);
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.text6};
    background: rgba(104, 110, 148, 0.1);
  }
  border-radius: 0;

  &:first-child {
    border-radius: 8px 0px 0px 8px;
  }

  &:last-child {
    border-radius: 0 8px 8px 0;
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
  const navigate = useNavigate()

  return (
    <Root>
      <Tab
        active={activeChartTab === ChartTabsOptions.SIMPLE}
        onClick={() => {
          if (activeChartTab !== ChartTabsOptions.SIMPLE) {
            setActiveChartTab(ChartTabsOptions.SIMPLE)
            navigate({ pathname: '/swap' })
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
            navigate({ pathname: '/swap/pro' })
          }
        }}
        title="Advanced Trade View"
        disabled={!hasBothCurrenciesInput}
      >
        Pro
      </Tab>
      <Tab
        active={activeChartTab === ChartTabsOptions.OFF}
        onClick={() => {
          if (activeChartTab !== ChartTabsOptions.OFF) {
            setActiveChartTab(ChartTabsOptions.OFF)
            navigate({ pathname: '/swap' })
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
