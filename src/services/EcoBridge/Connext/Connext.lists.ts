import { ChainId, DAI, USDC, USDT, WBTC, WETH } from '@swapr/sdk'

import { ZERO_ADDRESS } from '../../../constants'

import { Asset, ConnextToken } from './Connext.types'

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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: WBTC[ChainId.OPTIMISM_MAINNET].address,
        contract_decimals: WBTC[ChainId.OPTIMISM_MAINNET].decimals,
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
      [ChainId.BSC_MAINNET]: {
        contract_address: '0x886c7c24b7A6C39a53ee95efa3f5E1B81DF37Ca5',
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
      [ChainId.OPTIMISM_MAINNET]: {
        contract_address: '0x35d48a789904e9b15705977192e5d95e2af7f1d3',
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

export const Assets: Asset[] = [
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    image: '/logos/assets/usdc.png',
    is_stablecoin: true,
    contracts: [
      {
        contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chain_id: 1,
        decimals: 6,
        image: '/logos/assets/usdc.png',
      },
      {
        contract_address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        chain_id: 56,
        decimals: 18,
        image: '/logos/assets/usdc.png',
        next_asset: {
          contract_address: '0x5e7D83dA751F4C9694b13aF351B30aC108f32C38',
          decimals: 6,
          symbol: 'nextUSDC',
          image: '/logos/assets/nextusdc.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chain_id: 137,
        decimals: 6,
        image: '/logos/assets/usdc.png',
        next_asset: {
          contract_address: '0xF96C6d2537e1af1a9503852eB2A4AF264272a5B6',
          decimals: 6,
          symbol: 'nextUSDC',
          image: '/logos/assets/nextusdc.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        chain_id: 10,
        decimals: 6,
        image: '/logos/assets/usdc.png',
        next_asset: {
          contract_address: '0x67E51f46e8e14D4E4cab9dF48c59ad8F512486DD',
          decimals: 6,
          symbol: 'nextUSDC',
          image: '/logos/assets/nextusdc.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        chain_id: 42161,
        decimals: 6,
        image: '/logos/assets/usdc.png',
        next_asset: {
          contract_address: '0x8c556cF37faa0eeDAC7aE665f1Bb0FbD4b2eae36',
          decimals: 6,
          symbol: 'nextUSDC',
          image: '/logos/assets/nextusdc.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        chain_id: 100,
        decimals: 6,
        image: '/logos/assets/usdc.png',
        next_asset: {
          contract_address: '0x44CF74238d840a5fEBB0eAa089D05b763B73faB8',
          decimals: 6,
          symbol: 'nextUSDC',
          image: '/logos/assets/nextusdc.png',
        },
        is_pool: true,
      },
    ],
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    image: '/logos/assets/usdt.png',
    is_stablecoin: true,
    contracts: [
      {
        contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chain_id: 1,
        decimals: 6,
        image: '/logos/assets/usdt.png',
      },
      {
        contract_address: '0x55d398326f99059fF775485246999027B3197955',
        chain_id: 56,
        decimals: 18,
        image: '/logos/assets/usdt.png',
        next_asset: {
          contract_address: '0xD609f26B5547d5E31562B29150769Cb7c774B97a',
          decimals: 6,
          symbol: 'nextUSDT',
          image: '/logos/assets/nextusdt.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        chain_id: 137,
        decimals: 6,
        image: '/logos/assets/usdt.png',
        next_asset: {
          contract_address: '0xE221C5A2a8348f12dcb2b0e88693522EbAD2690f',
          decimals: 6,
          symbol: 'nextUSDT',
          image: '/logos/assets/nextusdt.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        chain_id: 10,
        decimals: 6,
        image: '/logos/assets/usdt.png',
        next_asset: {
          contract_address: '0x4cBB28FA12264cD8E87C62F4E1d9f5955Ce67D20',
          decimals: 6,
          symbol: 'nextUSDT',
          image: '/logos/assets/nextusdt.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        chain_id: 42161,
        decimals: 6,
        image: '/logos/assets/usdt.png',
        next_asset: {
          contract_address: '0x2fD7E61033b3904c65AA9A9B83DCd344Fa19Ffd2',
          decimals: 6,
          symbol: 'nextUSDT',
          image: '/logos/assets/nextusdt.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
        chain_id: 100,
        decimals: 6,
        image: '/logos/assets/usdt.png',
        next_asset: {
          contract_address: '0xF4d944883D6FddC56d3534986feF82105CaDbfA1',
          decimals: 6,
          symbol: 'nextUSDT',
          image: '/logos/assets/nextusdt.png',
        },
        is_pool: true,
      },
    ],

    exclude_source_chains: ['binance'],
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai',
    image: '/logos/assets/dai.png',
    is_stablecoin: true,
    contracts: [
      {
        contract_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chain_id: 1,
        decimals: 18,
        image: '/logos/assets/dai.png',
      },
      {
        contract_address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
        chain_id: 56,
        decimals: 18,
        image: '/logos/assets/dai.png',
        next_asset: {
          contract_address: '0x86a343BCF17D79C475d300eed35F0145F137D0c9',
          decimals: 18,
          symbol: 'nextDAI',
          image: '/logos/assets/nextdai.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        chain_id: 137,
        decimals: 18,
        image: '/logos/assets/dai.png',
        next_asset: {
          contract_address: '0xaDCe87b14d570665222C1172D18a221BF7690d5a',
          decimals: 18,
          symbol: 'nextDAI',
          image: '/logos/assets/nextdai.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        chain_id: 10,
        decimals: 18,
        image: '/logos/assets/dai.png',
        next_asset: {
          contract_address: '0xd64Bd028b560bbFc732eA18f282c64B86F3468e0',
          decimals: 18,
          symbol: 'nextDAI',
          image: '/logos/assets/nextdai.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        chain_id: 42161,
        decimals: 18,
        image: '/logos/assets/dai.png',
        next_asset: {
          contract_address: '0xfDe99b3B3fbB69553D7DaE105EF34Ba4FE971190',
          decimals: 18,
          symbol: 'nextDAI',
          image: '/logos/assets/nextdai.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
        chain_id: 100,
        decimals: 18,
        image: '/logos/assets/wxdai.png',
        symbol: 'WXDAI',
        next_asset: {
          contract_address: '0x0e1D5Bcd2Ac5CF2f71841A9667afC1E995CaAf4F',
          decimals: 18,
          symbol: 'nextDAI',
          image: '/logos/assets/nextdai.png',
        },
        wrapable: true,
        is_pool: true,
      },
    ],

    exclude_source_chains: ['binance'],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    image: '/logos/assets/eth.png',
    contracts: [
      {
        contract_address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        chain_id: 1,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        wrapable: true,
      },
      {
        contract_address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        chain_id: 56,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        next_asset: {
          contract_address: '0xA9CB51C666D2AF451d87442Be50747B31BB7d805',
          decimals: 18,
          symbol: 'nextWETH',
          image: '/logos/assets/nextweth.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        chain_id: 137,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        next_asset: {
          contract_address: '0x4b8BaC8Dd1CAA52E32C07755c17eFadeD6A0bbD0',
          decimals: 18,
          symbol: 'nextWETH',
          image: '/logos/assets/nextweth.png',
        },
        is_pool: true,
      },
      {
        contract_address: '0x4200000000000000000000000000000000000006',
        chain_id: 10,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        next_asset: {
          contract_address: '0xbAD5B3c68F855EaEcE68203312Fd88AD3D365e50',
          decimals: 18,
          symbol: 'nextWETH',
          image: '/logos/assets/nextweth.png',
        },
        wrapable: true,
        is_pool: true,
      },
      {
        contract_address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        chain_id: 42161,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        next_asset: {
          contract_address: '0x2983bf5c334743Aa6657AD70A55041d720d225dB',
          decimals: 18,
          symbol: 'nextWETH',
          image: '/logos/assets/nextweth.png',
        },
        wrapable: true,
        is_pool: true,
      },
      {
        contract_address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
        chain_id: 100,
        decimals: 18,
        symbol: 'WETH',
        image: '/logos/assets/weth.png',
        next_asset: {
          contract_address: '0x538E2dDbfDf476D24cCb1477A518A82C9EA81326',
          decimals: 18,
          symbol: 'nextWETH',
          image: '/logos/assets/nextweth.png',
        },
        is_pool: true,
      },
    ],
  },
]
