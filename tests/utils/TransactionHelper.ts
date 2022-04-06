import 'etherscan-api/dist/bundle.js'
import './AddressesEnum'
import { EtherscanFacade } from './EtherscanFacade'
import { SubgraphFacade } from './SubgraphFacade'

export class TransactionHelper {
  static checkIfTxFromLocalStorageHaveNoError() {
    cy.log('Checking tx status from ETHERSCAN API')
    cy.window().then(() => {
      EtherscanFacade.transactionStatus(TransactionHelper.getTxFromStorage()).should(res => {
        expect(res.body.result.isError).to.be.eq('0')
      })
    })
  }

  //Assertion accuracy is +/- value that can be added before check. 0 means that this is 100% accurate
  static checkErc20TokenBalance(
    tokenAdress: string,
    balanceBefore: number,
    transactionValue: number,
    assertionAccuracy: number
  ) {
    const expectedTransactionValue: number = transactionValue * Math.pow(10, 18)
    cy.log('Checking token balance from ETHERSCAN API')
    EtherscanFacade.erc20TokenBalance(tokenAdress).should(res => {
      console.log('ACTUAL ERC 20 TOKEN BALANCE FROM ETHERSCAN', res)
      console.log('EXPECTED TRANSACTION VALUE', expectedTransactionValue)
      console.log('EXPECTED BALANCE AFTER', balanceBefore + expectedTransactionValue)
      expect(parseInt(res.body.result)).to.be.closeTo(balanceBefore + expectedTransactionValue, assertionAccuracy)
    })
  }
  static checkSubgraphTransaction(
    expectedToken0Symbol: string,
    expectedToken1Symbol: string,
    expectedToken0Value: number,
    expectedToken1Value: number
  ) {
    cy.window().then(() => {
      SubgraphFacade.transaction(TransactionHelper.getTxFromStorage()).then(res => {
        console.log('SUBGRAPH RESPONSE', res.body.data)
        expect(res.body.data.transactions[0].swaps[0].pair.token0.symbol).to.be.eq(expectedToken0Symbol)
        expect(res.body.data.transactions[0].swaps[0].pair.token1.symbol).to.be.eq(expectedToken1Symbol)
        expect(res.body.data.transactions[0].swaps[0].amount1In).to.be.eq(expectedToken1Value.toString())
        expect(parseFloat(res.body.data.transactions[0].swaps[0].amount0Out)).to.be.greaterThan(expectedToken0Value)
      })
    })
  }

  static getTxFromStorage() {
    console.log('tx', Object.keys(JSON.parse(localStorage.getItem('swapr_transactions')!)[4])[0])
    return Object.keys(JSON.parse(localStorage.getItem('swapr_transactions')!)[4])[0]
  }
}
