import { ChainId, WETH } from '@swapr/sdk'

import { DAI, USDC, USDT, WBTC, ZERO_ADDRESS } from '../../../constants'
import { ConnextToken } from './Connext.types'

//connext's list of tokens
export const CONNEXT_TOKENS: ConnextToken[] = [
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/usdt.svg',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: USDT[ChainId.MAINNET].address,
        contract_decimals: USDT[ChainId.MAINNET].decimals,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: USDT[ChainId.ARBITRUM_ONE].address,
        contract_decimals: USDT[ChainId.ARBITRUM_ONE].decimals,
      },
      [ChainId.XDAI]: {
        contract_address: USDT[ChainId.XDAI].address,
        contract_decimals: USDT[ChainId.XDAI].decimals,
      },
      [ChainId.POLYGON]: {
        contract_address: USDT[ChainId.POLYGON].address,
        contract_decimals: USDT[ChainId.POLYGON].decimals,
      },
    },
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/usdc.svg',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: USDC[ChainId.MAINNET].address,
        contract_decimals: USDC[ChainId.MAINNET].decimals,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: USDC[ChainId.ARBITRUM_ONE].address,
        contract_decimals: USDC[ChainId.ARBITRUM_ONE].decimals,
      },
      [ChainId.XDAI]: {
        contract_address: USDC[ChainId.XDAI].address,
        contract_decimals: USDC[ChainId.XDAI].decimals,
      },
      [ChainId.POLYGON]: {
        contract_address: USDC[ChainId.POLYGON].address,
        contract_decimals: USDC[ChainId.POLYGON].decimals,
      },
    },
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/dai.svg',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: DAI[ChainId.MAINNET].address,
        contract_decimals: DAI[ChainId.MAINNET].decimals,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: DAI[ChainId.ARBITRUM_ONE].address,
        contract_decimals: DAI[ChainId.ARBITRUM_ONE].decimals,
      },
      [ChainId.XDAI]: {
        contract_address: ZERO_ADDRESS,
        contract_decimals: 18,
      },
      [ChainId.POLYGON]: {
        contract_address: DAI[ChainId.POLYGON].address,
        contract_decimals: DAI[ChainId.POLYGON].decimals,
      },
    },
  },
  {
    id: 'weth',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/weth.svg',
    contracts: {
      [ChainId.XDAI]: {
        contract_address: WETH[ChainId.XDAI].address,
        contract_decimals: WETH[ChainId.XDAI].decimals,
      },
      [ChainId.MAINNET]: {
        contract_address: ZERO_ADDRESS,
        contract_decimals: 18,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: ZERO_ADDRESS,
        contract_decimals: 18,
      },
      [ChainId.POLYGON]: {
        contract_address: WETH[ChainId.POLYGON].address,
        contract_decimals: WETH[ChainId.POLYGON].decimals,
      },
    },
  },
  {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/wbtc.svg',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: WBTC[ChainId.MAINNET].address,
        contract_decimals: WBTC[ChainId.MAINNET].decimals,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: WBTC[ChainId.ARBITRUM_ONE].address,
        contract_decimals: WBTC[ChainId.ARBITRUM_ONE].decimals,
      },
      [ChainId.XDAI]: {
        contract_address: WBTC[ChainId.XDAI].address,
        contract_decimals: WBTC[ChainId.XDAI].decimals,
      },
      [ChainId.POLYGON]: {
        contract_address: WBTC[ChainId.POLYGON].address,
        contract_decimals: WBTC[ChainId.POLYGON].decimals,
      },
    },
  },
  {
    id: 'grt',
    symbol: 'GRT',
    name: 'Graph Token',
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/grt.svg',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
        contract_decimals: 18,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: '0x23a941036ae778ac51ab04cea08ed6e2fe103614',
        contract_decimals: 18,
      },
      [ChainId.XDAI]: {
        contract_address: '0xfadc59d012ba3c110b08a15b7755a5cb7cbe77d7',
        contract_decimals: 18,
      },
      [ChainId.POLYGON]: {
        contract_address: '0x5fe2b58c013d7601147dcdd68c143a77499f5531',
        contract_decimals: 18,
      },
    },
  },
  {
    id: 'gno',
    symbol: 'GNO',
    is_staging: true,
    logoURI: 'https://maticnetwork.github.io/polygon-token-assets/assets/gno.svg',
    name: 'Gnosis Token',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
        contract_decimals: 18,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: '0xa0b862f60edef4452f25b4160f177db44deb6cf1',
        contract_decimals: 18,
      },
      [ChainId.XDAI]: {
        contract_address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        contract_decimals: 18,
      },
      [ChainId.POLYGON]: {
        contract_address: '0x5ffd62d3c3ee2e81c00a7b9079fb248e7df024a8',
        contract_decimals: 18,
      },
    },
  },
  {
    id: 'fei',
    symbol: 'FEI',
    name: 'Fei USD',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
        contract_decimals: 18,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: '0x4a717522566c7a09fd2774ccedc5a8c43c5f9fd2',
        contract_decimals: 18,
      },
      [ChainId.POLYGON]: {
        contract_address: '0xc7031408c7978da9aca03308cd104cb54e7a2eb3',
        contract_decimals: 18,
      },
    },
  },
  {
    id: 'magic',
    symbol: 'MAGIC',
    is_staging: true,
    name: 'Magic',
    contracts: {
      [ChainId.MAINNET]: {
        contract_address: '0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a',
        contract_decimals: 18,
      },
      [ChainId.ARBITRUM_ONE]: {
        contract_address: '0x539bde0d7dbd336b79148aa742883198bbf60342',
        contract_decimals: 18,
      },
    },
  },
]
