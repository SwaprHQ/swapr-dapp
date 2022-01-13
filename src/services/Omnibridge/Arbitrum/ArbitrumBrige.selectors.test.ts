import store, { AppState } from '../../../state'
import { BridgeList } from '../Omnibridge.types'
import { arbitrumSelectorsFactory } from './ArbitrumBridge.selectors'
import { arbitrumActions, arbitrumReducers } from './ArbitrumBridge.reducer'
import { combineReducers, configureStore } from '@reduxjs/toolkit'

const mockStore = configureStore({
  reducer: {
    omnibridge: combineReducers({ ...arbitrumReducers })
  }
})

describe('Arbitrum Bridge selectors', () => {
  const selectors = arbitrumSelectorsFactory([BridgeList.ARB_MAINNET, BridgeList.ARB_TESTNET])['arbitrum:testnet']
  const actions = arbitrumActions['arbitrum:testnet']

  it('selectOwnedTxs', () => {
    expect(selectors.selectOwnedTxs(mockStore.getState() as AppState, 'eloszki')).toEqual({})
  })
})
