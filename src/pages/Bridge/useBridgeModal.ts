import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../state'
import { ChainId } from '@swapr/sdk'
import { BridgeModalState, BridgeModalStatus } from '../../state/bridge/reducer'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'

//TODO move hook to better place
export const useBridgeModal = (): {
  modalData: BridgeModalState
  setModalState: (status: BridgeModalStatus, error?: string) => void
  setModalData: ({
    symbol,
    typedValue,
    fromChainId,
    toChainId
  }: Pick<BridgeModalState, 'symbol' | 'typedValue'> & { fromChainId: ChainId; toChainId: ChainId }) => void
} => {
  const { fromNetworkId, status, symbol, toNetworkId, typedValue, error } = useSelector(
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
    }: Pick<BridgeModalState, 'symbol' | 'typedValue'> & { fromChainId: ChainId; toChainId: ChainId }) => {
      dispatch(
        omnibridgeUIActions.setBridgeModalData({ symbol: symbol ? symbol : '', typedValue, fromChainId, toChainId })
      )
    },
    [dispatch]
  )

  return {
    modalData: {
      status,
      symbol,
      typedValue,
      fromNetwork: {
        chainId: fromNetworkId
      },
      toNetwork: {
        chainId: toNetworkId
      },
      error
    },
    setModalState,
    setModalData
  }
}
