import { configureStore } from '@reduxjs/toolkit'
import { load, save } from 'redux-localstorage-simple'

import {
  ecoBridgePersistedKeys,
  fixCorruptedEcoBridgeLocalStorageEntries,
} from '../services/EcoBridge/EcoBridge.config'
import ecoBridge from '../services/EcoBridge/store/EcoBridge.reducer'
import application from './application/reducer'
import bridgeTransactions from './bridgeTransactions/reducer'
import burn from './burn/reducer'
import fees from './fees/reducer'
import { updateVersion } from './global/actions'
import lists from './lists/reducer'
import mint from './mint/reducer'
import multiChainLinks from './multi-chain-links/reducer'
import multicall from './multicall/reducer'
import swap from './swap/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'claim', 'bridgeTransactions', ...ecoBridgePersistedKeys]

const persistenceNamespace = 'swapr'

// Fixes #1012
fixCorruptedEcoBridgeLocalStorageEntries(persistenceNamespace)

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    fees,
    swap,
    mint,
    burn,
    multicall,
    multiChainLinks,
    lists,
    bridgeTransactions,
    ecoBridge,
  },
  middleware: [
    save({
      states: PERSISTED_KEYS,
      namespace: persistenceNamespace,
    }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS, namespace: persistenceNamespace }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
