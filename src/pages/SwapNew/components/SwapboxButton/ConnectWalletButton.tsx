import { useUnsupportedChainIdError } from '../../../../hooks'
import { ApplicationModal } from '../../../../state/application/actions'
import {
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useWalletSwitcherPopoverToggle,
} from '../../../../state/application/hooks'
import { StyledButton, SwapButtonLabel } from './styles'

export function ConnectWalletButton() {
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const networkSwitcherPopoverOpen = useModalOpen(ApplicationModal.NETWORK_SWITCHER)
  const unsupportedChainIdError = useUnsupportedChainIdError()
  const isSwitchNetwork = networkSwitcherPopoverOpen || unsupportedChainIdError

  return (
    <StyledButton
      onClick={isSwitchNetwork ? toggleNetworkSwitcherPopover : toggleWalletSwitcherPopover}
      disabled={networkSwitcherPopoverOpen}
    >
      <SwapButtonLabel>{isSwitchNetwork ? 'Switch Network' : 'Connect Wallet'}</SwapButtonLabel>
    </StyledButton>
  )
}
