import { createContext } from 'react'

export enum SwapTab {
  Swap = 'EcoRouter',
  LimitOrder = 'LimitOrder',
  BridgeSwap = 'BridgeSwap',
  AdvancedTradingView = 'AdvancedTradingView',
}

export interface ISwapContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
}

export const SwapContext = createContext<ISwapContext>({
  activeTab: SwapTab.Swap,
  setActiveTab: () => {},
})
