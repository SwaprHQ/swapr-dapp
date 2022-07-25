import { ChainId, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { formatDistance, subDays } from 'date-fns'

// TODO: find better way to do it
export const WrappedNative = {
  [ChainId.MAINNET]: WETH[ChainId.MAINNET],
  [ChainId.ARBITRUM_ONE]: WETH[ChainId.ARBITRUM_ONE],
  [ChainId.XDAI]: WXDAI[ChainId.XDAI],
  [ChainId.POLYGON]: WMATIC[ChainId.POLYGON],
  [ChainId.RINKEBY]: WETH[ChainId.RINKEBY],
  [ChainId.ARBITRUM_RINKEBY]: WETH[ChainId.ARBITRUM_RINKEBY],
}

// FIX: sometimes this throws error
export const formatDate = (timestamp: number) =>
  formatDistance(subDays(new Date(timestamp), 3), new Date(), {
    addSuffix: true,
  })
