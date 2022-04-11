import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../state'
import { ecoBridgeUIActions } from '../../services/EcoBridge/store/UI.reducer'
import { BridgeModalData, BridgeModalState, BridgeModalStatus } from '../../services/EcoBridge/EcoBridge.types'

//TODO move hook to better place
export const useBridgeModal = (): {
  modalData: BridgeModalState
  setModalState: (status: BridgeModalStatus, error?: string) => void
  setModalData: ({ symbol, typedValue, fromChainId, toChainId }: BridgeModalData) => void
} => {
  const { fromChainId, status, symbol, toChainId, typedValue, error, disclaimerText } = useSelector(
    (state: AppState) => state.ecoBridge.ui.modal
  )

  const dispatch = useDispatch()

  const setModalState = useCallback(
    (status: BridgeModalStatus, error?: string) => {
      dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status, error }))
    },
    [dispatch]
  )

  const setModalData = useCallback(
    ({ symbol, typedValue, fromChainId, toChainId }: BridgeModalData) => {
      dispatch(
        ecoBridgeUIActions.setBridgeModalData({
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
