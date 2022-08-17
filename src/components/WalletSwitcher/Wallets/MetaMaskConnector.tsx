import { Connector } from '@web3-react/types'
import React from 'react'

import { metaMask, metaMaskHooks } from '../../../connectors'
import { getIsInjected, getIsMetaMask } from '../../../connectors/utils'
import { ConnectorType } from '../../../constants'
import { useWeb3ReactCore } from '../../../hooks/useWeb3ReactCore'
import { WalletOption } from '../WalletOption'

export const MetaMaskConnector = ({ tryActivation }: { tryActivation: (connector: Connector) => void }) => {
  const { connector: activeConnector } = useWeb3ReactCore()
  const isWalletDetected = getIsInjected() && getIsMetaMask()
  const isActive = metaMaskHooks.useIsActive() && activeConnector === metaMask

  return (
    <WalletOption
      id={ConnectorType.METAMASK}
      connector={metaMask}
      tryActivation={tryActivation}
      isActive={isActive}
      isWalletDetected={isWalletDetected}
    />
  )
}
