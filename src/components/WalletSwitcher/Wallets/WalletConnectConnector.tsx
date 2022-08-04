import { Connector } from '@web3-react/types'
import React from 'react'

import { walletConnect, walletConnectHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function WalletConnectConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = walletConnectHooks.useIsActive()

  return (
    <WalletOption
      id={ConnectorType.WALLET_CONNECT}
      connector={walletConnect}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={true} //TODO
    />
  )
}
