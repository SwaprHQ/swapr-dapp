import { coinbaseWallet, coinbaseWalletHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { useWeb3ReactCore } from '../../../hooks/useWeb3ReactCore'
import { WalletOption } from '../WalletOption'
import { TryActivationType } from '../WalletOption.types'

export const CoinbaseWalletConnector = ({ tryActivation }: { tryActivation: TryActivationType }) => {
  const { connector: activeConnector } = useWeb3ReactCore()
  const isActive = coinbaseWalletHooks.useIsActive() && activeConnector === coinbaseWallet

  return (
    <WalletOption
      id={ConnectorType.COINBASE}
      connector={coinbaseWallet}
      tryActivation={tryActivation}
      isActive={isActive}
    />
  )
}
