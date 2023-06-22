import { ReactNode, createContext, useEffect, useState } from 'react'

import { LimitOrderBase, logger } from './LimitOrder.utils'

export const LimitOrderContext = createContext<LimitOrderBase>({} as LimitOrderBase)

// TODO: May be don't need a provider. Need to verify at end and remove if not needed
export function LimitOrderProvider({ children, protocol }: { children: ReactNode; protocol: LimitOrderBase }) {
  const [value, setProtocol] = useState<LimitOrderBase>(protocol)

  useEffect(() => {
    logger('Limit Order Protocol Changed')
    setProtocol(protocol)
  }, [protocol])

  return <LimitOrderContext.Provider value={value}>{children}</LimitOrderContext.Provider>
}
