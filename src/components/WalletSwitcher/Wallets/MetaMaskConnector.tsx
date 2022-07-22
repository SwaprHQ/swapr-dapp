import { Connector } from '@web3-react/types'
import { getIsMetaMask } from 'connectors/utils'
import React, { useEffect } from 'react'

import { metaMask, metaMaskHooks } from '../../../connectors'
import { WalletType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function MetaMaskConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isInstalledWallet = getIsMetaMask()
  const isActive = metaMaskHooks.useIsActive()
  // attempt to connect eagerly on mount
  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to MetaMask')
    })
  }, [])
  return (
    <WalletOption
      id={WalletType.METAMASK}
      connector={metaMask}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={isInstalledWallet}
    />
  )
}
