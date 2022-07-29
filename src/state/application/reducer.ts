import { ChainId } from '@swapr/sdk'

import { createReducer } from '@reduxjs/toolkit'

import { WalletType } from './../../constants'
import {
  ApplicationModal,
  MainnetGasPrice,
  PopupContent,
  setConnectorError,
  setConnectorInfo,
  setOpenModal,
  updateBlockNumber,
  updateMainnetGasPrices,
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly mainnetGasPrices: { readonly [variant in MainnetGasPrice]: string } | null
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly chainId: ChainId | undefined
  readonly account: string | null | undefined
  errorByWalletType: Record<WalletType, string | undefined>
}

export const initialState: ApplicationState = {
  blockNumber: {},
  mainnetGasPrices: null,
  popupList: [],
  openModal: null,
  chainId: undefined,
  account: null,
  errorByWalletType: {
    [WalletType.METAMASK]: undefined,
    [WalletType.WALLET_CONNECT]: undefined,
    [WalletType.COINBASE]: undefined,
    [WalletType.NETWORK]: undefined,
  },
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(updateMainnetGasPrices, (state, action) => {
      state.mainnetGasPrices = action.payload
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(setConnectorInfo, (state, action) => {
      const { account, chainId } = action.payload
      state.account = account
      state.chainId = chainId
    })
    .addCase(setConnectorError, (state, action) => {
      const { connector, connectorError } = action.payload
      state.errorByWalletType[connector] = connectorError
    })
)
