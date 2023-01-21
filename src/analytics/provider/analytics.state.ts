import { Trade } from '@swapr/sdk'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

export enum ActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  CLEAR = 'CLEAR',
}

export enum ItemStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

interface AnalyticsTradeQueueItem {
  id: string
  item: Trade | BridgeTransactionSummary
  status: ItemStatus
  retries: number
}

export type AnalyticsTradeQueueState = Record<string, AnalyticsTradeQueueItem>

type AnalyticsTradeQueueStateAction =
  | {
      type: ActionType.ADD | ActionType.UPDATE
      payload: AnalyticsTradeQueueItem
    }
  | {
      type: ActionType.CLEAR
    }

export function reducer(
  state: AnalyticsTradeQueueState,
  action: AnalyticsTradeQueueStateAction
): AnalyticsTradeQueueState {
  switch (action.type) {
    case ActionType.ADD || ActionType.UPDATE:
      return {
        ...state,
        [action.payload.id]: action.payload,
      }
    case ActionType.CLEAR:
      return {}
    default:
      return state
  }
}
