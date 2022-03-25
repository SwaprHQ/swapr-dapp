import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useBridgeInfo } from '../../../services/Omnibridge/Omnibrige.hooks'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { commonActions } from '../../../services/Omnibridge/store/Common.reducer'
import { omnibridgeUIActions } from '../../../services/Omnibridge/store/UI.reducer'
import { AppState } from '../../../state'

export const useBridgeInputValidation = (collecting: boolean) => {
  const value = useSelector((state: AppState) => state.omnibridge.UI.from.value)

  const omnibridge = useOmnibridge()
  const dispatch = useDispatch()
  const activeBridge = useSelector<AppState>(state => state.omnibridge.common.activeBridge)

  const { from, to, showAvailableBridges } = useSelector((state: AppState) => state.omnibridge.UI)
  const { isBalanceSufficient } = useBridgeInfo()

  useEffect(() => {
    if (showAvailableBridges) {
      omnibridge.getSupportedBridges()
    }
  }, [showAvailableBridges, omnibridge, value, from.address, to.address, from.chainId, to.chainId])

  useEffect(() => {
    if (collecting) return

    const validateInput = () => {
      if (Number(value) === 0 || isNaN(Number(value))) {
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
      if (Number(value) > 0 && !from.address && !to.address) {
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
      //show available bridges when first two steps of validation are passed (amount > 0,token is selected)
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
            label: 'Select bridge below',
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
  }, [value, omnibridge, activeBridge, isBalanceSufficient, dispatch, from.address, to.address, collecting])
}
