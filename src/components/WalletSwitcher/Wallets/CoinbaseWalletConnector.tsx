import { Connector } from '@web3-react/types'
import React from 'react'

import { coinbaseWallet, coinbaseWalletHooks } from '../../../connectors'
import { getIsCoinbaseWallet } from '../../../connectors/utils'
import { ConnectorType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export const CoinbaseWalletConnector = ({ tryActivation }: { tryActivation: (connector: Connector) => void }) => {
  const isInstalledWallet = getIsCoinbaseWallet() //TODO need this?
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
