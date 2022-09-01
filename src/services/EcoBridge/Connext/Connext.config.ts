import { ChainId } from '@swapr/sdk'

export const connextSdkChainConfig = {
  [ChainId.MAINNET]: {
    providers: ['https://rpc.ankr.com/eth'],
    transactionManagerAddress: '0x31eFc4AeAA7c39e54A33FDc3C46ee2Bd70ae0A09',
  },
  [ChainId.XDAI]: {
    providers: ['https://rpc.ankr.com/gnosis'],
    transactionMangerAddress: '0x115909BDcbaB21954bEb4ab65FC2aBEE9866fa93',
  },
  [ChainId.ARBITRUM_ONE]: {
    providers: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
    transactionManagerAddress: '0xcF4d2994088a8CDE52FB584fE29608b63Ec063B2',
  },
  [ChainId.POLYGON]: {
    providers: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
    transactionManagerAddress: '0x6090De2EC76eb1Dc3B5d632734415c93c44Fd113',
  },
}
