import { ChainId } from '@swapr/sdk'

import { createReducer } from '@reduxjs/toolkit'

import { ConnectorType } from './../../constants'
import {
  ApplicationModal,
  MainnetGasPrice,
  PopupContent,
  setConnectorError,
  setConnectorInfo,
  setOpenModal,
  updateBlockNumber,
  updateMainnetGasPrices,
  updatePendingConnector,
  updateSelectedConnector,
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly mainnetGasPrices: { readonly [variant in MainnetGasPrice]: string } | null
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly chainId: ChainId | undefined
  readonly account: string | null | undefined
  // We want the user to be able to define which wallet they want to use, even if there are multiple connected wallets via web3-react.
  // If a user had previously connected a wallet but didn't have a wallet override set (because they connected prior to this field being added),
  // we want to handle that case by backfilling them manually. Once we backfill, we set the backfilled field to `true`.
  // After some period of time, our active users will have this property set so we can likely remove the backfilling logic.
  connector: {
    pending?: ConnectorType
    selected?: ConnectorType
    selectedBackfilled: boolean
    errorByType: Record<ConnectorType, string | undefined>
  }
}

export const initialState: ApplicationState = {
  blockNumber: {},
  mainnetGasPrices: null,
  popupList: [],
  openModal: null,
  chainId: undefined,
  account: null,
  connector: {
    pending: undefined,
    selected: undefined,
    selectedBackfilled: false,
    errorByType: {
      [ConnectorType.METAMASK]: undefined,
      [ConnectorType.WALLET_CONNECT]: undefined,
      [ConnectorType.COINBASE]: undefined,
      [ConnectorType.NETWORK]: undefined,
    },
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
    .addCase(updateSelectedConnector, (state, action) => {
      state.connector.selected = action.payload.selectedConnector
      state.connector.selectedBackfilled = true
    })
    .addCase(updatePendingConnector, (state, action) => {
      state.connector.pending = action.payload.pendingConnector
    })
    .addCase(setConnectorError, (state, action) => {
      const { connector, connectorError } = action.payload
      state.connector.errorByType[connector] = connectorError
    })
)
