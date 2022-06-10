import { createAction } from '@reduxjs/toolkit'

import { ApplicationState } from './reducer'

export type PopupContent = {
  hash: string
  success: boolean
  summary?: string
}

export enum ApplicationModal {
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  MOBILE,
  WALLET_SWITCHER,
  NETWORK_SWITCHER,
  ETHEREUM_OPTION,
  NETWORK_SWITCHER_FROM,
  NETWORK_SWITCHER_TO,
  UNSUPPORTED_NETWORK,
  SIMPLE_SETTINGS,
}

export enum MainnetGasPrice {
  INSTANT = 'INSTANT',
  FAST = 'FAST',
  NORMAL = 'NORMAL',
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const updateMainnetGasPrices = createAction<{ [variant in MainnetGasPrice]: string } | null>(
  'application/updateMainnetGasPrices'
)
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const setConnectorInfo = createAction<Pick<ApplicationState, 'account' | 'chainId'>>(
  'application/setConnectorInfo'
)
