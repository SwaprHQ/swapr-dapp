import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

import { AppState } from '../index'

const fees = createSelector(
  (state: AppState) => state.fees,
  fees => fees
)
export function useFeesState(): AppState['fees'] {
  return useSelector<AppState, AppState['fees']>(fees)
}
