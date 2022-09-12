import { coinbaseWallet, coinbaseWalletHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { useWeb3ReactCore } from '../../../hooks/useWeb3ReactCore'
import { WalletOption } from '../WalletOption'
import { ConnectorProps } from '../WalletOption.types'

export const CoinbaseWalletConnector = ({ tryActivation }: Pick<ConnectorProps, 'tryActivation'>) => {
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
