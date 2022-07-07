import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

import { INFURA_PROJECT_ID } from '../constants/'

export const [coinbaseWallet, hooks] = initializeConnector<CoinbaseWallet>(
  actions =>
    new CoinbaseWallet({
      actions,
      options: {
        url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      },
    })
)
