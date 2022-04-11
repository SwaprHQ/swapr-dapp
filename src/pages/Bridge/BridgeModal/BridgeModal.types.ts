import { ModalProps } from '../../../components/Modal'

export type BridgeModalType = 'pending' | 'disclaimer' | 'error' | 'success' | 'initiated' | 'collecting' | null

export interface BridgeModalContentProps extends ModalProps {
  modalType: BridgeModalType
  onConfirm: () => void
  setDisableConfirm: (val: boolean) => void
  disableConfirm: boolean
  disclaimerText?: string
  heading?: string
  text?: string
  error?: string
}
