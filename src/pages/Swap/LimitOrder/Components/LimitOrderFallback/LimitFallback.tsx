import { ButtonPrimary } from '../../../../../components/Button'
import { useWalletSwitcherPopoverToggle } from '../../../../../state/application/hooks'

import { Text } from './styled'

export default function LimitOrderFallback() {
  const toggleWalletModal = useWalletSwitcherPopoverToggle()
  return (
    <>
      <Text>Please connect wallet to access Limit Order</Text>
      <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
    </>
  )
}
