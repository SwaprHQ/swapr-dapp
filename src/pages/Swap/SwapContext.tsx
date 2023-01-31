import { createContext } from 'react'

import { ChartOption, SwapTab } from '../../state/user/reducer'

export interface ISwapTabContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
  activeChartTab: ChartOption
  setActiveChartTab: (tab: ChartOption) => void
}

export const SwapTabContext = createContext<ISwapTabContext>({
  activeTab: SwapTab.SWAP,
  setActiveTab: () => {},
  activeChartTab: ChartOption.OFF,
  setActiveChartTab: () => {},
})
