import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BridgeList, OptionalBridgeList, SupportedChainsConfig } from '../Omnibridge.types'

interface CommonState {
  activeBridge?: BridgeList
  supportedChains?: {
    [k in BridgeList]: SupportedChainsConfig
  }
  activeLists: any
}

const initialState: CommonState = {
  activeBridge: undefined,
  supportedChains: undefined,
  activeLists: undefined
}

const commonSlice = createSlice({
  initialState,
  name: 'common',
  reducers: {
    setActiveBridge: (state, { payload }: PayloadAction<OptionalBridgeList>) => {
      state.activeBridge = payload
    },
    setSupportedChains: (state, { payload }: PayloadAction<{ [k in BridgeList]: SupportedChainsConfig }>) => {
      state.supportedChains = payload
    }
  }
})

export const { actions: commonActions, reducer } = commonSlice
