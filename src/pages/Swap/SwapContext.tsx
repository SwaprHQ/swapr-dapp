import { createContext } from 'react'

import { ChartOptions } from '../../state/user/reducer'

export enum SwapTab {
  Swap = 'EcoRouter',
  LimitOrder = 'LimitOrder',
  BridgeSwap = 'BridgeSwap',
  AdvancedTradingView = 'AdvancedTradingView',
}

export interface ISwapContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
  activeChartTab: ChartOptions
  setActiveChartTab: (tab: ChartOptions) => void
}

export const SwapContext = createContext<ISwapContext>({
  activeTab: SwapTab.Swap,
  setActiveTab: () => {},
  activeChartTab: ChartOptions.OFF,
  setActiveChartTab: () => {},
})
