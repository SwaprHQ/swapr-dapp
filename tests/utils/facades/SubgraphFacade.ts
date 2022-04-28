export class SubgraphFacade {
  private static SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby'
  static transaction(txid: string, retries = 0): any {
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
          if (retries > 100) {
            throw new Error('Retried too many times')
          }
          return this.transaction(txid, retries++)
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
  static liquidityCampaign(owner: string, startsAt: number, retries = 0): any {
    return cy
      .request({
        method: 'POST',
        url: this.SUBGRAPH_URL,
        body: {
          query:
            `
{
  liquidityMiningCampaigns(where:{
    owner:"` +
            owner +
            `"
    startsAt: "` +
            startsAt +
            `"
  }, first:1) {
    owner
    startsAt
    endsAt
    stakablePair{
      token0{
        symbol
      }
      token1{
        symbol
      }
    }
    rewards{
      token{
        symbol
      }
      amount
    }
  }
}

`
        }
      })
      .then(resp => {
        console.log(resp)
        console.log(retries)
        console.log(startsAt)
        try {
          expect(resp.body.data.liquidityMiningCampaigns).to.have.length.greaterThan(0)
        } catch (err) {
          if (retries > 100) {
            throw new Error('Retried too many times')
          }
          cy.wait(500)
          return this.liquidityCampaign(owner, startsAt, ++retries)
        }
        return resp
      })
  }
}
