import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../state'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'
import { BridgeModalState, BridgeModalStatus } from '../../services/Omnibridge/Omnibridge.types'

//TODO move hook to better place
export const useBridgeModal = (): {
  modalData: BridgeModalState
  setModalState: (status: BridgeModalStatus, error?: string) => void
  setModalData: ({
    symbol,
    typedValue,
    fromChainId,
    toChainId
  }: Pick<BridgeModalState, 'symbol' | 'typedValue' | 'fromChainId' | 'toChainId'>) => void
} => {
  const { fromChainId, status, symbol, toChainId, typedValue, error, disclaimerText } = useSelector(
    (state: AppState) => state.omnibridge.UI.modal
  )

  const dispatch = useDispatch()

  const setModalState = useCallback(
    (status: BridgeModalStatus, error?: string) => {
      dispatch(omnibridgeUIActions.setBridgeModalStatus({ status, error }))
    },
    [dispatch]
  )

  const setModalData = useCallback(
    ({
      symbol,
      typedValue,
      fromChainId,
      toChainId
    }: Pick<BridgeModalState, 'symbol' | 'typedValue' | 'fromChainId' | 'toChainId'>) => {
      dispatch(
        omnibridgeUIActions.setBridgeModalData({
          symbol: symbol ?? '',
          typedValue,
          fromChainId,
          toChainId
        })
      )
    },
    [dispatch]
  )

  return {
    modalData: {
      status,
      symbol,
      typedValue,
      fromChainId,
      toChainId,
      error,
      disclaimerText
    },
    setModalState,
    setModalData
  }
}
