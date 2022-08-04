import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import React, { ReactNode, useMemo } from 'react'

import { Connection } from '../../connectors'
import { getConnectionName } from '../../connectors/utils'
import useEagerlyConnect from '../../hooks/useEagerlyConnect'
import useOrderedConnections from '../../hooks/useOrderedConnections'

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  useEagerlyConnect()
  const connections = useOrderedConnections()
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks])

  const key = useMemo(() => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'), [connections])

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  )
}
