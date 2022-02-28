import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useDebounce from '../../../hooks/useDebounce'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { commonActions } from '../../../services/Omnibridge/store/Common.reducer'
import { omnibridgeUIActions } from '../../../services/Omnibridge/store/UI.reducer'
import { useBridgeInfo } from '../../../state/bridge/hooks'
import { AppState } from '../../../state'

export const useBridgeInputValidation = (value: string, isBridge: boolean) => {
  const debounce = useDebounce(value, 500)
  const omnibridge = useOmnibridge()
  const dispatch = useDispatch()
  const activeBridge = useSelector((state: AppState) => state.omnibridge.common.activeBridge)
  const activeRouteId = useSelector((state: AppState) => state.omnibridge.common.activeRouteId)
  const { from, to, showAvailableBridges } = useSelector((state: AppState) => state.omnibridge.UI)
  const { isBalanceSufficient } = useBridgeInfo()

  useEffect(() => {
    if (showAvailableBridges && isBridge) {
      omnibridge.getSupportedBridges()
    }
  }, [showAvailableBridges, omnibridge, debounce, from.address, to.address, isBridge])

  useEffect(() => {
    if (!isBridge) return

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
        dispatch(omnibridgeUIActions.setTo({ value: '' }))
        return false
      }
      if (Number(debounce) > 0 && !from.address && !to.address) {
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
      // if (!isBalanceSufficient) {
      //   dispatch(
      //     omnibridgeUIActions.setStatusButton({
      //       label: 'Insufficient balance',
      //       isError: false,
      //       isLoading: false,
      //       isBalanceSufficient: false,
      //       approved: false
      //     })
      //   )
      //   return false
      // }

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
  }, [
    debounce,
    omnibridge,
    activeBridge,
    isBalanceSufficient,
    dispatch,
    from.address,
    to.address,
    activeRouteId,
    isBridge
  ])
}
