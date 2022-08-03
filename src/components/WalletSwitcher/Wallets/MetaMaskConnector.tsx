import { Connector } from '@web3-react/types'
import { getIsMetaMask } from 'connectors/utils'
import React from 'react'

import { metaMask, metaMaskHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function MetaMaskConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isInstalledWallet = getIsMetaMask()
  const isActive = metaMaskHooks.useIsActive()

  return (
    <WalletOption
      id={ConnectorType.METAMASK}
      connector={metaMask}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={isInstalledWallet}
    />
  )
}
