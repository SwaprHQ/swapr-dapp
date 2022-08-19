import { walletConnect, walletConnectHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { useWeb3ReactCore } from '../../../hooks/useWeb3ReactCore'
import { WalletOption } from '../WalletOption'
import { TryActivationType } from '../WalletOption.types'

export const WalletConnectConnector = ({ tryActivation }: { tryActivation: TryActivationType }) => {
  const { connector: activeConnector } = useWeb3ReactCore()
  const isActive = walletConnectHooks.useIsActive() && activeConnector === walletConnect

  return (
    <WalletOption
      id={ConnectorType.WALLET_CONNECT}
      connector={walletConnect}
      tryActivation={tryActivation}
      isActive={isActive}
    />
  )
}
