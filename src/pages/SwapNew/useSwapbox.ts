import { useReducer } from 'react'

type SwapBoxState = {
  fromValue: number
  toValue: number
}

enum ActionTypes {
  INPUT_FROM_CHANGE = 'INPUT_FROM_CHANGE',
  INPUT_TO_CHANGE = 'INPUT_TO_CHANGE',
}

type Action = {
  type: ActionTypes
  payload: any // TODO: UPDATE THIS
}

const initialState: SwapBoxState = {
  fromValue: 0,
  toValue: 0,
}

const RATE = 1600

function reducer(state: SwapBoxState, action: Action) {
  switch (action.type) {
    case ActionTypes.INPUT_FROM_CHANGE:
      return {
        ...state,
        fromValue: action.payload,
        toValue: action.payload * RATE,
      }
    case ActionTypes.INPUT_TO_CHANGE:
      return {
        ...state,
        fromValue: action.payload / RATE,
        toValue: action.payload,
      }
    default:
      throw new Error('Unknow action type!')
  }
}

export const useSwapbox = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return { state, dispatch }
}
