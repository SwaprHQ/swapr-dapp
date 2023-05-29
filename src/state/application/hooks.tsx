import { ReactNode, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Id, toast } from 'react-toastify'

import { NotificationPopup } from '../../components/Popups/NotificationPopup'
import { StacklyPopup } from '../../components/Popups/StacklyPopup'
import { TransactionPopup } from '../../components/Popups/TransactionPopup'
import { useActiveWeb3React } from '../../hooks'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { AppDispatch, AppState } from '../index'
import { useUpdateClosedStacklyPopup } from '../user/hooks'

import { ApplicationModal, MainnetGasPrice, PopupContent, setOpenModal } from './actions'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useMainnetGasPrices(): { [speed in MainnetGasPrice]: string } | null {
  return useSelector((state: AppState) => state.application.mainnetGasPrices)
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useToggleMobileMenu(): () => void {
  return useToggleModal(ApplicationModal.MOBILE)
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useShowExpeditionsPopup(): boolean {
  return useModalOpen(ApplicationModal.EXPEDITIONS)
}

export function useToggleShowExpeditionsPopup(): () => void {
  return useToggleModal(ApplicationModal.EXPEDITIONS)
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useNetworkSwitcherPopoverToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK_SWITCHER)
}

export function useWalletSwitcherPopoverToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET_SWITCHER)
}

export function useEthereumOptionPopoverToggle(): () => void {
  return useToggleModal(ApplicationModal.ETHEREUM_OPTION)
}

export function useSimpleSettingsModal(): () => void {
  return useToggleModal(ApplicationModal.SIMPLE_SETTINGS)
}

export function useAddPopup(): (content: PopupContent, autoClose?: number | false) => void {
  return useCallback((content: PopupContent, autoClose: number | false = 15000) => {
    toast.info(<TransactionPopup {...content} />, {
      autoClose,
      icon: false,
      progressStyle: {
        background: 'hsla(0,0%,100%,.7)',
      },
    })
  }, [])
}

export function useNotificationPopup() {
  return useCallback((text: ReactNode, status?: boolean, autoClose: number | false = 15000) => {
    toast.info(<NotificationPopup text={text} status={status} />, {
      autoClose,
      icon: false,
      progressStyle: {
        background: 'hsla(0,0%,100%,.7)',
      },
    })
  }, [])
}

export function useStacklyPopup(): () => Id {
  const isMobileMedia = useIsMobileByMedia()
  const [, setClosedStacklyPopup] = useUpdateClosedStacklyPopup()
  const isYellow = process.env.REACT_APP_STACKLY_POPUP_COLOR === 'yellow'

  return useCallback((): Id => {
    return toast.info(<StacklyPopup isYellow={isYellow} />, {
      closeOnClick: false,
      autoClose: false,
      icon: false,
      position: toast.POSITION.BOTTOM_RIGHT,
      style: {
        width: isMobileMedia ? '' : '290px',
        marginLeft: isMobileMedia ? '' : '50px',
        background: isYellow ? '#fac336' : '#a2e771',
      },
      onClose: () => {
        setClosedStacklyPopup(true)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
