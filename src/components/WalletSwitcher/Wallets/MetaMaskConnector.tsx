import { Connector } from '@web3-react/types'
import React from 'react'

import { metaMask, metaMaskHooks } from '../../../connectors'
import { getIsMetaMask } from '../../../connectors/utils'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export const MetaMaskConnector = ({ tryActivation }: { tryActivation: (connector: Connector) => void }) => {
  const isInstalledWallet = getIsMetaMask() //TODO need this?
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
