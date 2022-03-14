import { ChainId } from '@swapr/sdk'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BridgeModalState, BridgeModalStatus, BridgeTxsFilter } from '../Omnibridge.types'

type OmnibridgeInput = {
  value: string
  chainId: ChainId
  address: string
  decimals?: number
  name?: string
  symbol?: string
}

type UIInitialState = Record<'from' | 'to', OmnibridgeInput> & {
  statusButton: {
    isError: boolean
    isLoading: boolean
    label: string
    isBalanceSufficient: boolean
    approved: boolean
  }
  modal: BridgeModalState
  filter: BridgeTxsFilter
  isCheckingWithdrawals: boolean
  showAvailableBridges: boolean
}

const initialState: UIInitialState = {
  from: {
    value: '',
    chainId: ChainId.MAINNET,
    address: '',
    decimals: 0
  },
  to: {
    value: '',
    chainId: ChainId.ARBITRUM_ONE,
    address: '',
    decimals: 0
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
    disclaimerText: '',
    fromChainId: ChainId.MAINNET,
    toChainId: ChainId.ARBITRUM_ONE
  },
  filter: BridgeTxsFilter.RECENT,
  isCheckingWithdrawals: false,
  showAvailableBridges: false
}

export const omnibridgeUISlice = createSlice({
  name: 'UI',
  initialState,
  reducers: {
    setFrom(state, action: PayloadAction<Partial<OmnibridgeInput>>) {
      const { address, value, chainId, decimals, name, symbol } = action.payload
      if (address !== undefined) {
        state.from.address = address
      }

      if (value !== undefined) {
        state.from.value = value
      }

      if (chainId) {
        if (chainId === state.to.chainId) {
          state.to.chainId = state.from.chainId
        }
        state.from.chainId = chainId
      }

      if (decimals) {
        state.from.decimals = decimals
      }

      if (name) {
        state.from.name = name
      }

      if (symbol) {
        state.from.symbol = symbol
      }
    },
    setTo(state, action: PayloadAction<Partial<OmnibridgeInput>>) {
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
      state.modal.fromChainId = action.payload.fromChainId
      state.modal.toChainId = action.payload.toChainId
    },
    setModalDisclaimerText(state, action: PayloadAction<string>) {
      state.modal.disclaimerText = action.payload
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
    setShowAvailableBridges(state, action: PayloadAction<boolean>) {
      state.showAvailableBridges = action.payload
    }
  }
})

export const { actions: omnibridgeUIActions, reducer } = omnibridgeUISlice
