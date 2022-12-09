import { createReducer } from '@reduxjs/toolkit'

import {
  ConnectorType,
  DEFAULT_DEADLINE_FROM_NOW,
  DEFAULT_USER_MULTIHOP_ENABLED,
  INITIAL_ALLOWED_SLIPPAGE,
} from '../../constants'
import { MainnetGasPrice } from '../application/actions'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  setConnectorError,
  toggleURLWarning,
  updateMatchesDarkMode,
  updatePendingConnector,
  updateSelectedChartOption,
  updateSelectedConnector,
  updateSelectedSwapTab,
  updateUserAdvancedSwapDetails,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserMultihop,
  updateUserPreferredGasPrice,
  updateUserSlippageTolerance,
} from './actions'

const currentTimestamp = () => new Date().getTime()

export enum ChartOptions {
  OFF,
  SIMPLE_CHART,
  PRO,
}

export enum SwapTabs {
  SWAP,
  LIMIT_ORDER,
  BRIDGE_SWAP,
}

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches

  userExpertMode: boolean
  selectedSwapTab: SwapTabs

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  // whether multihop trades are wnabled or not
  userMultihop: boolean

  // the gas price the user would like to use on mainnet
  userPreferredGasPrice: MainnetGasPrice | string | null

  //user chart option preference
  selectedChartOption?: ChartOptions

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }

  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

  timestamp: number
  URLWarningVisible: boolean
  userAdvancedSwapDetails: boolean

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

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  userDarkMode: true,
  matchesDarkMode: false,
  userExpertMode: false,
  selectedSwapTab: 0,
  selectedChartOption: 0,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  userMultihop: DEFAULT_USER_MULTIHOP_ENABLED,
  userPreferredGasPrice: MainnetGasPrice.FAST,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
  userAdvancedSwapDetails: true,
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
    .addCase(updateVersion, state => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      // multihop isnt being tracked in local storage, reset to default
      if (typeof state.userMultihop !== 'boolean') {
        state.userMultihop = DEFAULT_USER_MULTIHOP_ENABLED
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, state => {
      // TODO: fix this once light theme goes live
      state.userDarkMode = true // action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, state => {
      // TODO: fix this once light theme goes live
      state.matchesDarkMode = true // action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserMultihop, (state, action) => {
      state.userMultihop = action.payload.userMultihop
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserPreferredGasPrice, (state, action) => {
      state.userPreferredGasPrice = action.payload
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateSelectedSwapTab, (state, action) => {
      state.selectedSwapTab = action.payload.selectedSwapTab
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId][address]
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { serializedPair } }) => {
      const chainId = serializedPair.token0.chainId
      if (state.pairs[chainId]) {
        const tokenAAddress = serializedPair.token0.address
        const tokenBAddress = serializedPair.token1.address
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(toggleURLWarning, state => {
      state.URLWarningVisible = !state.URLWarningVisible
    })
    .addCase(updateUserAdvancedSwapDetails, (state, action) => {
      state.userAdvancedSwapDetails = action.payload.userAdvancedSwapDetails
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
    .addCase(updateSelectedChartOption, (state, action) => {
      state.selectedChartOption = action.payload.selectedChartOption
    })
)
