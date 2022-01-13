import { combineReducers, createSlice } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'

const omnibridgeReducer = combineReducers({
  ...arbitrumReducers
})

export default omnibridgeReducer
