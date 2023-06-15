import { ReactNode, createContext } from 'react'

import { LimitOrder } from './LimitOrder'

export const LimitOrderContext = createContext<LimitOrder | null>(null)

export function LimitOrderProvider({ children }: { children: ReactNode }) {
  return children
}
