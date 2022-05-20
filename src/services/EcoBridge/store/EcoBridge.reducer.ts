import { combineReducers } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'
import { reducer as uiReducer } from './UI.reducer'
import { reducer as commonReducer } from './Common.reducer'
import { socketReducers } from '../Socket/Socket.reducer'
import { omniBridgeReducers } from '../OmniBridge/OmniBridge.reducers'

const ecoBridgeReducer = combineReducers({
  ui: uiReducer,
  common: commonReducer,
  ...arbitrumReducers,
  ...socketReducers,
  ...omniBridgeReducers,
})

export default ecoBridgeReducer
