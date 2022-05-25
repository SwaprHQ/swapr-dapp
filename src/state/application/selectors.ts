import { createSelector } from '@reduxjs/toolkit'
import { AppState } from '..'
import { getChainPair } from '../../utils/arbitrum'

export const accountSelector = (state: AppState) => state.application.account

export const chainIdSelector = createSelector(
  (state: AppState) => state.application.chainId,
  chainId => getChainPair(chainId)
)
