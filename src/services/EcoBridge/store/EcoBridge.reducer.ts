import { combineReducers } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'
import { reducer as uiReducer } from './UI.reducer'
import { reducer as commonReducer } from './Common.reducer'
import { socketReducers } from '../Socket/Socket.reducer'

const ecoBridgeReducer = combineReducers({
  ui: uiReducer,
  common: commonReducer,
  ...arbitrumReducers,
  ...socketReducers,
})

export default ecoBridgeReducer
