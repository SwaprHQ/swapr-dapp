import { SdkConfig } from '@connext/sdk'

export const connextSdkConfig: SdkConfig['chains'] = {
  '6450786': {
    providers: ['https://rpc.ankr.com/bsc', 'https://1rpc.io/bnb', 'https://bscrpc.com'],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0x55d398326f99059fF775485246999027B3197955',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      },
      {
        name: 'Keep3rV1',
        symbol: 'KP3R',
        address: '0xB3de3929C3bE8a1Fa446f27d1b549Dd9d5C313E0',
      },
      {
        name: 'Keep3rLP',
        symbol: 'KLP',
        address: '0xf813835326f1c606892a36F96b6Cdd18D6d87De9',
      },
    ],
  },
  '6648936': {
    providers: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', 'https://rpc.builder0x69.io'],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
      {
        name: 'Keep3rV1',
        symbol: 'KP3R',
        address: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
      },
      {
        name: 'Keep3rLP',
        symbol: 'KLP',
        address: '0x3f6740b5898c5D3650ec6eAce9a649Ac791e44D7',
      },
    ],
  },
  '6778479': {
    providers: [
      'https://gnosis.blockpi.network/v1/rpc/public',
      'https://rpc.gnosis.gateway.fm',
      'https://rpc.gnosischain.com',
      'https://rpc.ankr.com/gnosis',
      'https://xdai-rpc.gateway.pokt.network',
      'https://gnosischain-rpc.gateway.pokt.network',
    ],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      },
      {
        name: 'Dai',
        symbol: 'WXDAI',
        address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
      },
      {
        name: 'Keep3rV1',
        symbol: 'KP3R',
        address: '0xA83ad51C99BB40995F9292C9a436046ab7578cAF',
      },
      {
        name: 'Keep3rLP',
        symbol: 'KLP',
        address: '0x87A93A942D10B6cC061A952C3A1213d52044bE97',
      },
    ],
  },
  '1634886255': {
    providers: [
      'https://arbitrum-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      'https://arbitrum.blockpi.network/v1/rpc/public',
      'https://arb1.arbitrum.io/rpc',
      'https://1rpc.io/arb',
    ],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      },
    ],
  },
  '1869640809': {
    providers: [
      'https://optimism-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      'https://optimism.blockpi.network/v1/rpc/public',
      'https://1rpc.io/op',
    ],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0x4200000000000000000000000000000000000006',
      },
      {
        name: 'Keep3rV1',
        symbol: 'KP3R',
        address: '0xa83ad51c99bb40995f9292c9a436046ab7578caf',
      },
      {
        name: 'Keep3rLP',
        symbol: 'KLP',
        address: '0x87A93A942D10B6cC061A952C3A1213d52044bE97',
      },
    ],
  },
  '1886350457': {
    providers: [
      'https://polygon-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      'https://matic-mainnet.chainstacklabs.com',
      'https://poly-rpc.gateway.pokt.network',
      'https://polygon.blockpi.network/v1/rpc/public',
      'https://1rpc.io/matic',
    ],
    assets: [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      },
      {
        name: 'Tether',
        symbol: 'USDT',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      },
      {
        name: 'Ethereum',
        symbol: 'WETH',
        address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      },
      {
        name: 'Keep3rV1',
        symbol: 'KP3R',
        address: '0x725dB429F0ff5A3DF5f41fcA8676CF9Dd1C6b3F0',
      },
      {
        name: 'Keep3rLP',
        symbol: 'KLP',
        address: '0x381BC51bb203c5940A398622be918C876cB0f035',
      },
    ],
  },
}
