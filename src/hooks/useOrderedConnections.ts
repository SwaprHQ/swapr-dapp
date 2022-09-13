import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { AppState } from '../state'
import { getConnection } from './../connectors/utils'
import { BACKFILLABLE_WALLETS, ConnectorType } from './../constants'

export default function useOrderedConnections() {
  const selectedConnector = useSelector((state: AppState) => state.user.connector.selected)
  return useMemo(() => {
    const orderedConnectionTypes: ConnectorType[] = []

    // Add the `selectedConnector` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedConnector) {
      orderedConnectionTypes.push(selectedConnector)
    }
    orderedConnectionTypes.push(...BACKFILLABLE_WALLETS.filter(wallet => wallet !== selectedConnector))

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectorType.NETWORK)

    return orderedConnectionTypes.map(getConnection)
  }, [selectedConnector])
}
