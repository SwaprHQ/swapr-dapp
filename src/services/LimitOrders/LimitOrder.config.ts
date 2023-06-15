import { ChainId } from '@swapr/sdk'

import { OneInch } from './1Inch/OneInch'
import { CoW } from './CoW/CoW'
import { LimitOrderBase } from './LimitOrder.utils'

export const limitOrderConfig: LimitOrderBase[] = [
  new CoW({
    supportedChains: [ChainId.MAINNET, ChainId.GNOSIS],
    protocol: 'CoW',
  }),
  new OneInch({
    supportedChains: [ChainId.POLYGON, ChainId.OPTIMISM_MAINNET, ChainId.ARBITRUM_ONE, ChainId.BSC_MAINNET],
    protocol: '1inch',
  }),
]
