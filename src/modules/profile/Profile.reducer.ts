import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Accent {
  tokenId: string
  name: string
  imageURI: string
  description: string
  gradientColors: string[]
}

export interface ProfileState {
  activeAccent?: string
  ownedAccents: { [tokenId: string]: Accent }
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

const initialState: ProfileState = {
  activeAccent: undefined,
  ownedAccents: {},
  error: undefined,
  status: 'idle',
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    activeAccentUpdated(state, action: PayloadAction<Pick<ProfileState, 'activeAccent'>>) {
      const { activeAccent } = action.payload

      if (state.activeAccent === activeAccent) {
        state.activeAccent = undefined
      } else {
        state.activeAccent = activeAccent
      }
    },
    statusUpdated(state, action: PayloadAction<Pick<ProfileState, 'status' | 'error'>>) {
      const { status, error } = action.payload

      state.status = status
      state.error = error
    },
    ownedAccentsUpdated(state, action: PayloadAction<Pick<ProfileState, 'ownedAccents'>>) {
      const { ownedAccents } = action.payload

      state.ownedAccents = ownedAccents
    },
  },
})

export const { actions: profileActions, reducer: profileReducer } = profileSlice
