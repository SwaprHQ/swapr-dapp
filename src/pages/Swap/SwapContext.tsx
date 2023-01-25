import { createContext } from 'react'

export enum SwapTab {
  SWAP = 'SWAP',
  LIMIT_ORDER = 'LIMIT_ORDER',
  BRIDGE_SWAP = 'BRIDGE_SWAP',
}

export enum ChartOptions {
  OFF = 'OFF',
  SIMPLE_CHART = 'SIMPLE_CHART',
  PRO = 'PRO',
}
export interface ISwapContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
  activeChartTab: ChartOptions
  setActiveChartTab: (tab: ChartOptions) => void
}

export const SwapContext = createContext<ISwapContext>({
  activeTab: SwapTab.SWAP,
  setActiveTab: () => {},
  activeChartTab: ChartOptions.OFF,
  setActiveChartTab: () => {},
})
