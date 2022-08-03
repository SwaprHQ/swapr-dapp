import { Connector } from '@web3-react/types'
import { getIsCoinbaseWallet } from 'connectors/utils'
import React from 'react'

import { coinbaseWallet, coinbaseWalletHooks } from '../../../connectors'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function CoinbaseConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isInstalledWallet = getIsCoinbaseWallet()
  const isActive = coinbaseWalletHooks.useIsActive()

  return (
    <WalletOption
      id={ConnectorType.COINBASE}
      connector={coinbaseWallet}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={isInstalledWallet}
    />
  )
}
