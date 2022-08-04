import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { AppState } from '../state'
import { getConnection } from './../connectors/utils'
import { BACKFILLABLE_WALLETS, ConnectorType } from './../constants'

export default function useOrderedConnections() {
  const selectedWallet = useSelector((state: AppState) => state.user.selectedWallet)
  return useMemo(() => {
    const orderedConnectionTypes: ConnectorType[] = []

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedWallet) {
      orderedConnectionTypes.push(selectedWallet)
    }
    orderedConnectionTypes.push(...BACKFILLABLE_WALLETS.filter(wallet => wallet !== selectedWallet))

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectorType.NETWORK)

    return orderedConnectionTypes.map(getConnection)
  }, [selectedWallet])
}
