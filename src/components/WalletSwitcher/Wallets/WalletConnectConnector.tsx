import { Connector } from '@web3-react/types'
import React, { useEffect } from 'react'

import { walletConnect, walletConnectHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function WalletConnectConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = walletConnectHooks.useIsActive()
  // attempt to connect eagerly on mount
  // useEffect(() => {
  //   void walletConnect.connectEagerly().catch(() => {
  //     console.debug('Failed to connect eagerly to Wallet Connect')
  //   })
  // }, [])
  return (
    <WalletOption
      id={ConnectorType.WALLET_CONNECT}
      connector={walletConnect}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={true}
    />
  )
}
