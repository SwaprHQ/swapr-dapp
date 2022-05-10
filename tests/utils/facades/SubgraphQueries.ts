export function TRANSACTIONS_QUERY(txnId: string) {
  return `
  {
    transactions(where:{id:"${txnId}"}){
  id
  blockNumber
  timestamp
  swaps{
    amount0In
    amount1In
    amount0Out
    amount1Out
    pair{
      token0{
        symbol
      }
      token1{
        symbol
      }
    }
  }
}
}
`
}
export function LIQUIDITY_CAMPAIGNS_QUERY(owner: string, startsAt: number) {
  return `
  {
    liquidityMiningCampaigns(where: { owner: "${owner}", startsAt: "${startsAt}" }, first: 1) {
      owner
      startsAt
      endsAt
      stakablePair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      rewards {
        token {
          symbol
        }
        amount
      }
    }
  }
`
}
export const TOKENS_QUERY = `
  {
    tokens(first: 500) {
      id
      symbol
      name
    }
  }
`
