import { Connector } from '@web3-react/types'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { AppState } from '../state'
import { networkConnection } from './../connectors'
import { getConnection } from './../connectors/utils'
import { BACKFILLABLE_WALLETS } from './../constants'

async function connect(connector: Connector) {
  try {
    connector.connectEagerly ? await connector.connectEagerly() : await connector.activate()
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

export default function useEagerlyConnect() {
  const selectedConnectorBackfilled = useSelector((state: AppState) => state.application.connector.selectedBackfilled)
  const selectedConnector = useSelector((state: AppState) => state.application.connector.selected)

  useEffect(() => {
    connect(networkConnection.connector)

    if (selectedConnector) {
      connect(getConnection(selectedConnector).connector)
      return
    }

    if (!selectedConnectorBackfilled) {
      BACKFILLABLE_WALLETS.map(getConnection)
        .map(connection => connection.connector)
        .forEach(connect)
    }
    // The dependency list is empty so this is only run once on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
