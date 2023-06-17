import { ReactNode, createContext } from 'react'

import { LimitOrderBase } from './LimitOrder.utils'

export const LimitOrderContext = createContext<LimitOrderBase>({} as LimitOrderBase)

export function LimitOrderProvider({ children, protocol }: { children: ReactNode; protocol: LimitOrderBase }) {
  return <LimitOrderContext.Provider value={protocol}>{children}</LimitOrderContext.Provider>
}
