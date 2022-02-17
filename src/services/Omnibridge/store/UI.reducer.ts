import { ChainId } from '@swapr/sdk'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BridgeModalStatus, BridgeTxsFilter } from '../../../state/bridge/reducer'
import { BridgeList } from '../Omnibridge.types'

type OmnibridgeInput = {
  value: string
  chainId: ChainId | undefined
  address: string
}

type UIInitialState = Record<'from' | 'to', OmnibridgeInput> & {
  statusButton: {
    isError: boolean
    isLoading: boolean
    label: string
    isBalanceSufficient: boolean
    approved: boolean
  }
  modal: {
    status: BridgeModalStatus
    symbol: string
    typedValue: string
    fromNetworkId: ChainId
    toNetworkId: ChainId
    error?: string
  }
  filter: BridgeTxsFilter
  isCheckingWithdrawals: boolean
  activeBridge: string
  activeLists: BridgeList[]
}

const initialState: UIInitialState = {
  from: {
    value: '',
    chainId: 1,
    address: ''
  },
  to: {
    value: '',
    chainId: 42161,
    address: ''
  },
  statusButton: {
    isError: false,
    isLoading: false,
    label: 'Enter amount',
    isBalanceSufficient: false,
    approved: false
  },
  modal: {
    status: BridgeModalStatus.CLOSED,
    symbol: '',
    typedValue: '',
    fromNetworkId: 1,
    toNetworkId: 42161
  },
  filter: BridgeTxsFilter.RECENT,
  isCheckingWithdrawals: false,
  activeBridge: '',
  activeLists: []
}

export const omnibridgeUISlice = createSlice({
  name: 'UI',
  initialState,
  reducers: {
    //FIX tmp solution (will be removed)
    reset(state) {
      state.statusButton.isError = false
      state.statusButton.isLoading = false
      state.statusButton.label = 'Enter amount'
      state.statusButton.isBalanceSufficient = false
      state.statusButton.approved = false
      state.from.address = ''
      state.from.value = ''
      state.to.address = ''
      state.activeBridge = ''
    },
    setFrom(state, action: PayloadAction<{ address?: string; value?: string; chainId?: ChainId }>) {
      const { address, value, chainId } = action.payload
      if (address !== undefined) {
        state.from.address = address
      }

      if (value !== undefined) {
        state.from.value = value
      }

      if (chainId) {
        state.from.chainId = chainId
      }
    },
    setTo(state, action: PayloadAction<{ address?: string; value?: string; chainId?: ChainId }>) {
      const { address, value, chainId } = action.payload
      if (address !== undefined) {
        state.to.address = address
      }
      if (value !== undefined) {
        state.to.value = value
      }
      if (chainId) {
        state.to.chainId = chainId
      }
    },
    swapBridgeChains(state) {
      const previous = state.from.chainId
      state.from.chainId = state.to.chainId
      state.to.chainId = previous
    },
    setBridgeTxsFilter(state, action: PayloadAction<BridgeTxsFilter>) {
      state.filter = action.payload
    },
    setBridgeLoadingWithdrawals(state, action: PayloadAction<boolean>) {
      state.isCheckingWithdrawals = action.payload
    },
    setBridgeModalStatus(state, action: PayloadAction<{ status: BridgeModalStatus; error?: string }>) {
      state.modal.status = action.payload.status
      state.modal.error = action.payload.error
    },
    setBridgeModalData(
      state,
      action: PayloadAction<{
        symbol: string
        typedValue: string
        fromChainId: ChainId
        toChainId: ChainId
      }>
    ) {
      state.from.value = action.payload.typedValue
      state.to.value = action.payload.typedValue

      state.from.chainId = action.payload.fromChainId
      state.to.chainId = action.payload.toChainId

      state.modal.symbol = action.payload.symbol
      state.modal.typedValue = action.payload.typedValue
      state.modal.fromNetworkId = action.payload.fromChainId
      state.modal.toNetworkId = action.payload.toChainId
    },
    setStatusButton(
      state,
      action: PayloadAction<{
        isError?: boolean
        isLoading?: boolean
        label?: string
        isBalanceSufficient?: boolean
        approved?: boolean
      }>
    ) {
      const { isError, isLoading, label, isBalanceSufficient, approved } = action.payload

      if (isError !== undefined) {
        state.statusButton.isError = isError
      }
      if (isLoading !== undefined) {
        state.statusButton.isLoading = isLoading
      }
      if (label) {
        state.statusButton.label = label
      }

      if (isBalanceSufficient !== undefined) {
        state.statusButton.isBalanceSufficient = isBalanceSufficient
      }

      if (approved !== undefined) {
        state.statusButton.approved = approved
      }
    },
    setSelectedActiveBridge(state, action: PayloadAction<string>) {
      state.activeBridge = action.payload
    }
  }
})

export const { actions: omnibridgeUIActions, reducer } = omnibridgeUISlice
