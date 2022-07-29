import { Connector } from '@web3-react/types'
import { getIsCoinbaseWallet } from 'connectors/utils'
import React, { useEffect } from 'react'

import { coinbaseWallet, coinbaseWalletHooks } from '../../../connectors'
import { WalletType } from '../../../constants'
import { WalletOption } from '../WalletOption'

export default function CoinbaseConnector({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isInstalledWallet = getIsCoinbaseWallet()
  const isActive = coinbaseWalletHooks.useIsActive()
  console.log('coinbase', isActive, isInstalledWallet)
  // attempt to connect eagerly on mount
  // useEffect(() => {
  //   void coinbaseWallet.connectEagerly().catch(() => {
  //     console.debug('Failed to connect eagerly to Coinbase Wallet')
  //   })
  // }, [])
  return (
    <WalletOption
      id={WalletType.COINBASE}
      connector={coinbaseWallet}
      tryActivation={tryActivation}
      isActive={isActive}
      isInstalledWallet={isInstalledWallet}
    />
  )
}
