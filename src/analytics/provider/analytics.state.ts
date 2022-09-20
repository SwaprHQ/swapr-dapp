import { Trade } from '@swapr/sdk'

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
  trade: Trade
  status: ItemStatus
  retries: number
}

type AnalyticsTradeQueueState = Record<string, AnalyticsTradeQueueItem>

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
