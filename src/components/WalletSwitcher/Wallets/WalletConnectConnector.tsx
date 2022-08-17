import { Connector } from '@web3-react/types'
import React from 'react'

import { walletConnect, walletConnectHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { useWeb3ReactCore } from '../../../hooks/useWeb3ReactCore'
import { WalletOption } from '../WalletOption'

export const WalletConnectConnector = ({ tryActivation }: { tryActivation: (connector: Connector) => void }) => {
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
