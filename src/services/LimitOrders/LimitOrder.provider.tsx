import { ReactNode, createContext, useEffect, useState } from 'react'

import { LimitOrderBase } from './LimitOrder.utils'

export const LimitOrderContext = createContext<LimitOrderBase>({} as LimitOrderBase)

export function LimitOrderProvider({ children, protocol }: { children: ReactNode; protocol: LimitOrderBase }) {
  const [value, setProtocol] = useState<LimitOrderBase>(protocol)

  useEffect(() => {
    // console.log('protocol change', protocol)
    setProtocol(protocol)
  }, [protocol, setProtocol])

  return <LimitOrderContext.Provider value={value}>{children}</LimitOrderContext.Provider>
}
