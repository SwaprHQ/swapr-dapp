import { ChainId, Currency, DAI, USDC, USDT, WBTC } from '@swapr/sdk'

export const MainPage = 'Governance Main Page'
export const PairPage = 'Governance Pair Page'

export const temporaryCurrencyData: Array<Currency> = [
  DAI[ChainId.MAINNET],
  USDC[ChainId.MAINNET],
  USDT[ChainId.MAINNET],
  WBTC[ChainId.MAINNET],
]
