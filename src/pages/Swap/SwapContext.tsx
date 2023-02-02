import { createContext } from 'react'

export enum SwapTab {
  Swap = 'Swap',
  LimitOrder = 'LimitOrder',
  BridgeSwap = 'BridgeSwap',
}

export enum ChartOptions {
  OFF = 'OFF',
  SIMPLE_CHART = 'SIMPLE_CHART',
  PRO = 'PRO',
}
export interface ISwapTabContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
  activeChartTab: ChartOptions
  setActiveChartTab: (tab: ChartOptions) => void
}

export const SwapTabContext = createContext<ISwapTabContext>({
  activeTab: SwapTab.Swap,
  setActiveTab: () => {},
  activeChartTab: ChartOptions.OFF,
  setActiveChartTab: () => {},
})
