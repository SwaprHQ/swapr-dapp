import { Store } from '@reduxjs/toolkit'
import { AppState } from '../../../state'
import { createArbitrumSlice } from './ArbitrumBridge.reducer'
import { clearBridgeTxs } from '../../../state/bridgeTransactions/actions'
import { SupportedChainsConfig } from '../Omnibridge.types'

export const migrateBridgeTransactions = (
  store: Store<AppState>,
  actions: ReturnType<typeof createArbitrumSlice>['actions'],
  supportedChains: SupportedChainsConfig
) => {
  const { bridgeTransactions } = store.getState()
  const { from, to } = supportedChains

  const fromTxs = bridgeTransactions[from]
  const toTxs = bridgeTransactions[to]

  if (!fromTxs || !toTxs || !Object.keys(fromTxs).length || !Object.keys(toTxs).length) return

  store.dispatch(actions.migrateTxs({ [from]: fromTxs, [to]: toTxs }))
  store.dispatch(clearBridgeTxs([from, to]))
}
