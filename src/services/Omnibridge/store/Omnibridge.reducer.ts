import { ChainId } from '@swapr/sdk'
import { combineReducers, createSlice } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'

type OmnibridgeInput = {
  value: number
  chainId: ChainId
  address: string
}

type UIInitialState = Record<'from' | 'to', OmnibridgeInput> & {
  statusButton: {
    isError: boolean
    isLoading: boolean
    label: string
  }
  modal: {
    show: boolean
    status: string
  }
  filter: []
}

const initialState: UIInitialState = {
  from: {
    value: 0,
    chainId: 1,
    address: ''
  },
  to: {
    value: 0,
    chainId: 1,
    address: ''
  },
  statusButton: {
    isError: false,
    isLoading: false,
    label: ''
  },
  modal: {
    show: false,
    status: ''
  },
  filter: []
}

export const omnibridgeUISlice = createSlice({
  name: 'UI',
  initialState,
  reducers: {}
})

export const { actions: omnibridgeUIActions } = omnibridgeUISlice

const omnibridgeReducer = combineReducers({
  UI: omnibridgeUISlice.reducer,
  ...arbitrumReducers
})

export default omnibridgeReducer
