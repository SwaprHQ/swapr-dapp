import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BridgeList, OptionalBridgeList, SupportedChainsConfig } from '../Omnibridge.types'

interface CommonState {
  activeBridge?: BridgeList
  supportedChains?: {
    [k in BridgeList]: SupportedChainsConfig
  }
  activeLists: string[]
  activeRouteId?: string
}

const initialState: CommonState = {
  activeBridge: undefined,
  supportedChains: undefined,
  activeLists: []
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
    },
    activateLists: (state, { payload }: PayloadAction<string[]>) => {
      payload.forEach(id => {
        if (!state.activeLists.includes(id)) {
          state.activeLists.push(id)
        }
      })
    },
    deactivateLists: (state, { payload }: PayloadAction<string[]>) => {
      const filteredList = state.activeLists.filter(id => !payload.includes(id))
      state.activeLists = filteredList
    },
    setActiveRouteId: (state, action: PayloadAction<string | undefined>) => {
      state.activeRouteId = action.payload
    }
  }
})

export const { actions: commonActions, reducer } = commonSlice
