export class SubgraphFacade {
  private static SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby'

  static transaction(txid: string) {
    return cy.request({
      method: 'POST',
      url: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
      body: {
        query:
          `
{
 transactions(where:{id:"` +
          txid +
          `"}){
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
    })
  }
  static tokens() {
    return cy.request({
      method: 'POST',
      url: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
      body: {
        query: `
{
tokens(first:500){
  id
  symbol
  name
}
}
`
      }
    })
  }
}
