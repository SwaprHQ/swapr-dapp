import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useBridgeInfo } from '../../../services/EcoBridge/EcoBridge.hooks'
import { useEcoBridge } from '../../../services/EcoBridge/EcoBridgeProvider'
import { commonActions } from '../../../services/EcoBridge/store/Common.reducer'
import { ecoBridgeUIActions } from '../../../services/EcoBridge/store/UI.reducer'
import { AppState } from '../../../state'

export const useBridgeInputValidation = (isCollecting: boolean, isOutputPanel: boolean) => {
  const ecoBridge = useEcoBridge()
  const dispatch = useDispatch()
  const activeBridge = useSelector<AppState>(state => state.ecoBridge.common.activeBridge)

  const { from, to, showAvailableBridges, isBridgeSwapActive } = useSelector((state: AppState) => state.ecoBridge.ui)

  const { address: fromTokenAddress, value: fromValue } = from
  const { address: toTokenAddress } = to

  const { isBalanceSufficient } = useBridgeInfo()

  useEffect(() => {
    if (showAvailableBridges && !isOutputPanel) {
      ecoBridge.getSupportedBridges()
    }
  }, [
    showAvailableBridges,
    ecoBridge,
    fromValue,
    fromTokenAddress,
    toTokenAddress,
    from.chainId,
    to.chainId,
    isOutputPanel,
  ])

  useEffect(() => {
    if (isCollecting || isOutputPanel) return

    const validateInput = () => {
      if (Number(fromValue) === 0 || isNaN(Number(fromValue))) {
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
      if (
        (isBridgeSwapActive && (!fromTokenAddress || !toTokenAddress)) ||
        (!isBridgeSwapActive && !fromTokenAddress)
      ) {
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
  }, [
    fromValue,
    ecoBridge,
    activeBridge,
    isBalanceSufficient,
    dispatch,
    fromTokenAddress,
    toTokenAddress,
    isCollecting,
    isBridgeSwapActive,
    isOutputPanel,
  ])
}
