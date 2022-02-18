import { combineReducers } from '@reduxjs/toolkit'
import { arbitrumReducers } from '../Arbitrum/ArbitrumBridge.reducer'
import { reducer as UIReducer } from './UI.reducer'
import { reducer as commonReducer } from './Common.reducer'

const omnibridgeReducer = combineReducers({
  UI: UIReducer,
  common: commonReducer,
  ...arbitrumReducers
})

export default omnibridgeReducer
