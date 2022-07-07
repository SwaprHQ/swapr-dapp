import { ChainId } from '@swapr/sdk'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { INFURA_PROJECT_ID } from '../constants'

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
  actions =>
    new WalletConnect({
      actions,
      options: {
        rpc: {
          [ChainId.XDAI]: 'https://rpc.gnosischain.com/',
          [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        },
      },
    })
)
