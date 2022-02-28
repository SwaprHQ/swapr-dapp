import { combineReducers } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'
import { reducer as UIReducer } from './UI.reducer'
import { reducer as commonReducer } from './Common.reducer'
import { socketReducers } from '../Socket/Socket.reducer'

const omnibridgeReducer = combineReducers({
  UI: UIReducer,
  common: commonReducer,
  ...arbitrumReducers,
  ...socketReducers
})

export default omnibridgeReducer
