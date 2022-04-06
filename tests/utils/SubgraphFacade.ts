export class SubgraphFacade {
  private static SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby'
  private static retries: number
  static transaction(txid: string): any {
    this.retries++
    return cy
      .request({
        method: 'POST',
        url: this.SUBGRAPH_URL,
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
      .then(resp => {
        try {
          expect(resp.body.data.transactions).to.have.length.greaterThan(0)
        } catch (err) {
          if (this.retries > 100) {
            throw new Error('Retried too many times')
          }
          return this.transaction(txid)
        }
        return resp
      })
  }
  static tokens() {
    return cy.request({
      method: 'POST',
      url: this.SUBGRAPH_URL,
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
