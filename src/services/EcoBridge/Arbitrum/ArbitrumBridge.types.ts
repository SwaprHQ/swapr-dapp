import { ChainId } from '@swapr/sdk'
import { TokenInfo, TokenList } from '@uniswap/token-lists'

export enum ArbitrumPendingReasons {
  TX_UNCONFIRMED = 'Transaction has not been confirmed yet',
  DEPOSIT = 'Waiting for deposit to be processed on L2 (~10 minutes)',
  WITHDRAWAL = 'Waiting for confirmation (~7 days of dispute period)',
}

export type ArbitrumTokenInfo = Omit<TokenInfo, 'extensions'> & {
  extensions: {
    bridgeInfo: {
      [k: number]: {
        tokenAddress: string
        originBridgeAddress: string
        destBridgeAddress: string
      }
    }
    l1Address?: string
    l2GatewayAddress?: string
    l1GatewayAddress?: string
  }
}

export type ArbitrumTokenList = Omit<TokenList, 'tokens'> & {
  tokens: ArbitrumTokenInfo[]
}

export const hasArbitrumMetadata = (tokenInfo: any, chain: ChainId): tokenInfo is ArbitrumTokenInfo => {
  const bridgeInfo = ((tokenInfo as unknown) as ArbitrumTokenInfo).extensions?.bridgeInfo
  return !!bridgeInfo && Object.keys(bridgeInfo).length === 1 && !!bridgeInfo[Number(chain)]
}
