import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useBridgeInfo } from '../../../services/EcoBridge/EcoBridge.hooks'
import { useEcoBridge } from '../../../services/EcoBridge/EcoBridgeProvider'
import { commonActions } from '../../../services/EcoBridge/store/Common.reducer'
import { ecoBridgeUIActions } from '../../../services/EcoBridge/store/UI.reducer'
import { AppState } from '../../../state'

export const useBridgeInputValidation = (isCollecting: boolean) => {
  const value = useSelector((state: AppState) => state.ecoBridge.ui.from.value)

  const ecoBridge = useEcoBridge()
  const dispatch = useDispatch()
  const activeBridge = useSelector<AppState>(state => state.ecoBridge.common.activeBridge)

  const { from, to, showAvailableBridges } = useSelector((state: AppState) => state.ecoBridge.ui)
  const { isBalanceSufficient } = useBridgeInfo()

  useEffect(() => {
    if (showAvailableBridges) {
      ecoBridge.getSupportedBridges()
    }
  }, [showAvailableBridges, ecoBridge, value, from.address, to.address, from.chainId, to.chainId])

  useEffect(() => {
    if (isCollecting) return

    const validateInput = () => {
      if (Number(value) === 0 || isNaN(Number(value))) {
        dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Enter amount',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        dispatch(ecoBridgeUIActions.setShowAvailableBridges(false))
        dispatch(commonActions.setActiveBridge(undefined))
        dispatch(ecoBridgeUIActions.setTo({ value: '' }))
        return false
      }
      if (Number(value) > 0 && !from.address && !to.address) {
        dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Select token',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return false
      }
      //show available bridges when first two steps of validation are passed (amount > 0,token is selected)
      dispatch(ecoBridgeUIActions.setShowAvailableBridges(true))

      //check balance
      if (!isBalanceSufficient) {
        dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Insufficient balance',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return false
      }

      if (!activeBridge) {
        dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Select bridge below',
            isError: false,
            isLoading: false,
            isBalanceSufficient: false,
            isApproved: false,
          })
        )
        return false
      }

      return true
    }

    const isValid = validateInput()

    if (isValid) {
      ecoBridge.validate()
    }
  }, [value, ecoBridge, activeBridge, isBalanceSufficient, dispatch, from.address, to.address, isCollecting])
}
