import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
import { ApplicationModal } from '../../state/application/actions'
import {
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useWalletSwitcherPopoverToggle,
} from '../../state/application/hooks'
import { ButtonPrimary } from '../Button'

export const ButtonConnect = () => {
  const { isActiveChainSupported } = useWeb3ReactCore()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const networkSwitcherPopoverOpen = useModalOpen(ApplicationModal.NETWORK_SWITCHER)
  const isSwitchNetwork = networkSwitcherPopoverOpen || !isActiveChainSupported

  return (
    <ButtonPrimary
      onClick={isSwitchNetwork ? toggleNetworkSwitcherPopover : toggleWalletSwitcherPopover}
      disabled={networkSwitcherPopoverOpen}
      data-testid="switch-connect-button"
    >
      {isSwitchNetwork ? 'Switch network' : 'Connect wallet'}
    </ButtonPrimary>
  )
}
