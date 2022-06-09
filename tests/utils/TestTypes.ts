export interface LiquidityCampaign {
  body: {
    data: {
      liquidityMiningCampaigns: {
        owner: string
        endsAt: string
        rewards: {
          amount: string
          token: {
            symbol: string
          }
        }[]
        stakablePair: { token0: { symbol: string }; token1: { symbol: string } }
      }[]
    }
  }
}
export interface Transaction {
  body: {
    data: {
      transactions: {
        id: string
        blockNumber: string
        timestamp: string
        swaps: {
          amount0In: string
          amount1In: string
          amount0Out: string
          amount1Out: string
          pair: {
            token0: { symbol: string }
            token1: { symbol: string }
          }
        }[]
      }[]
    }
  }
}

export interface Transaction {
  body: {
    data: {
      transactions: {
        id: string
        blockNumber: string
        timestamp: string
        swaps: {
          amount0In: string
          amount1In: string
          amount0Out: string
          amount1Out: string
          pair: {
            token0: { symbol: string }
            token1: { symbol: string }
          }
        }[]
      }[]
    }
  }
}
