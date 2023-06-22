import { ChainId, DAI, USDT, WETH, WXDAI } from '@swapr/sdk'

export const DefaultTokens = {
  [ChainId.MAINNET]: {
    sellToken: WETH[ChainId.MAINNET],
    buyToken: DAI[ChainId.MAINNET],
  },
  [ChainId.GNOSIS]: {
    sellToken: WXDAI[ChainId.GNOSIS],
    buy: USDT[ChainId.GNOSIS],
  },
}
