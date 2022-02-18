import { Currency } from '@swapr/sdk'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useDebounce from '../../../hooks/useDebounce'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { commonActions } from '../../../services/Omnibridge/store/Common.reducer'
import { omnibridgeUIActions } from '../../../services/Omnibridge/store/UI.reducer'
import { AppState } from '../../../state'
import { useBridgeInfo } from '../../../state/bridge/hooks'

export const useBridgeInputValidation = (value: string, currency: Currency | null | undefined) => {
  const debounce = useDebounce(value, 500)
  const omnibridge = useOmnibridge()
  const dispatch = useDispatch()
  const activeBridge = useSelector((state: AppState) => state.omnibridge.common.activeBridge)
  const { from, to } = useSelector((state: AppState) => state.omnibridge.UI)
  const { isBalanceSufficient } = useBridgeInfo()

  useEffect(() => {
    const validateInput = () => {
      if (Number(debounce) === 0 || isNaN(Number(debounce))) {
        dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Enter amount',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            approved: false
          })
        )
        dispatch(omnibridgeUIActions.setShowAvailableBridges(false))
        dispatch(commonActions.setActiveBridge(undefined))
        return false
      }
      if (Number(debounce) > 0 && !currency && !from.address && !to.address) {
        dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Select token',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            approved: false
          })
        )
        return false
      }

      dispatch(omnibridgeUIActions.setShowAvailableBridges(true))
      //check balance
      if (!isBalanceSufficient) {
        dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Insufficient balance',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            approved: false
          })
        )
        return false
      }

      if (!activeBridge) {
        dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Select bridge bellow',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            approved: false
          })
        )
        return false
      }

      return true
    }
    const isValid = validateInput()
    if (isValid) {
      omnibridge.validate()
    }
  }, [debounce, currency, omnibridge, activeBridge, isBalanceSufficient, dispatch, from.address, to.address])
}
