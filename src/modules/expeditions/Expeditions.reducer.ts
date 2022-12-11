import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { GetCampaignProgressResponse } from './api/generated'

export interface ExpeditionsState {
  dailySwapsTracked: boolean
  endDate?: GetCampaignProgressResponse['endDate']
  redeemEndDate?: GetCampaignProgressResponse['redeemEndDate']
  tasks: GetCampaignProgressResponse['tasks']
  rewards: GetCampaignProgressResponse['rewards']
  claimedFragments: GetCampaignProgressResponse['claimedFragments']
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

const initialState: ExpeditionsState = {
  dailySwapsTracked: false,
  claimedFragments: 0,
  tasks: {} as GetCampaignProgressResponse['tasks'],
  rewards: [],
  error: undefined,
  status: 'idle',
}

export const expeditionsSlice = createSlice({
  name: 'expeditions',
  initialState,
  reducers: {
    dailySwapsTrackingUpdated(state) {
      state.dailySwapsTracked = !state.dailySwapsTracked
    },
    statusUpdated(state, action: PayloadAction<Pick<ExpeditionsState, 'status' | 'error'>>) {
      const { status, error } = action.payload

      state.status = status
      state.error = error
    },
    expeditionsProgressUpdated(state, action: PayloadAction<GetCampaignProgressResponse>) {
      const { claimedFragments, rewards, tasks, endDate, redeemEndDate } = action.payload

      state.endDate = endDate
      state.redeemEndDate = redeemEndDate
      state.claimedFragments = claimedFragments
      state.rewards = rewards
      state.tasks = tasks
      state.status = 'success'
      state.error = undefined
    },
  },
})

export const { actions: expeditionsActions, reducer: expeditionsReducer } = expeditionsSlice
