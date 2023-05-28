import { ChainId, DAI, USDC, USDT, WETH } from '@swapr/sdk'

import { ZERO_ADDRESS } from '../../../constants'

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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: USDT[ChainId.OPTIMISM_MAINNET].address,
        contract_decimals: USDT[ChainId.OPTIMISM_MAINNET].decimals,
      },
      [ChainId.BSC_MAINNET]: {
        contract_address: USDT[ChainId.BSC_MAINNET].address,
        contract_decimals: USDT[ChainId.BSC_MAINNET].decimals,
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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: USDC[ChainId.OPTIMISM_MAINNET].address,
        contract_decimals: USDC[ChainId.OPTIMISM_MAINNET].decimals,
      },
      [ChainId.BSC_MAINNET]: {
        contract_address: USDC[ChainId.BSC_MAINNET].address,
        contract_decimals: USDC[ChainId.BSC_MAINNET].decimals,
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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: DAI[ChainId.OPTIMISM_MAINNET].address,
        contract_decimals: DAI[ChainId.OPTIMISM_MAINNET].decimals,
      },
      [ChainId.BSC_MAINNET]: {
        contract_address: DAI[ChainId.BSC_MAINNET].address,
        contract_decimals: DAI[ChainId.BSC_MAINNET].decimals,
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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: ZERO_ADDRESS,
        contract_decimals: 18,
      },
    },
  },
]
