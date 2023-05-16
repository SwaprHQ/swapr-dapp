export type BridgeModalType = 'pending' | 'disclaimer' | 'error' | 'success' | 'initiated' | 'collecting' | null

export interface BridgeModalContentProps {
  modalType: BridgeModalType
  onDismiss: () => void
  text: string
  error: string
  heading: string
  onConfirm: () => void
  disableConfirm: boolean
  setDisableConfirm: (val: boolean) => void
  bridgeName: string
}
