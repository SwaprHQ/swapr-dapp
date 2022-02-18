import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'
import { BridgeList, SupportedChainsConfig } from '../Omnibridge.types'
import { reducer as UIReducer } from './UI.reducer'

interface OptionsState {
  activeBridge?: BridgeList
  supportedChains?: {
    [k in BridgeList]: SupportedChainsConfig
  }
}

const initialState: OptionsState = {
  activeBridge: undefined,
  supportedChains: undefined
}

const optionsSlice = createSlice({
  initialState,
  name: 'options',
  reducers: {
    setActiveBridge: (state, { payload }: PayloadAction<BridgeList>) => {
      state.activeBridge = payload
    },
    setSupportedChains: (state, { payload }: PayloadAction<{ [k in BridgeList]: SupportedChainsConfig }>) => {
      state.supportedChains = payload
    }
  }
})

const { actions: optionsActions, reducer: optionsReducer } = optionsSlice

const omnibridgeReducer = combineReducers({
  UI: UIReducer,
  options: optionsReducer,
  ...arbitrumReducers
})

export default omnibridgeReducer

export { optionsActions }
