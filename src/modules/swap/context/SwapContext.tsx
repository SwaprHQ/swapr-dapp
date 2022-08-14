import { createContext } from 'react'

export enum SwapTab {
  EcoRouter = 'EcoRouter',
  LimitOrder = 'LimitOrder',
  BridgeSwap = 'BridgeSwap',
}

export interface ISwapContext {
  activeTab: SwapTab
  setActiveTab: (tab: SwapTab) => void
}

export const SwapContext = createContext<ISwapContext>({
  activeTab: SwapTab.EcoRouter,
  setActiveTab: () => {},
})
