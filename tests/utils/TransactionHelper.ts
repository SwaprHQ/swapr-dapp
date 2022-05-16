import 'etherscan-api/dist/bundle.js'
import './enums/AddressesEnum'
import { EtherscanFacade } from './facades/EtherscanFacade'
import { SubgraphFacade } from './facades/SubgraphFacade'
import { AddressesEnum } from './enums/AddressesEnum'
import { Transaction } from './TestTypes'

export class TransactionHelper {
  private static retries = 0

  static checkIfTxFromLocalStorageHaveNoError() {
    cy.log('Checking tx status from ETHERSCAN API')
    cy.window().then(() => {
      EtherscanFacade.transactionStatus(TransactionHelper.getTxFromStorage()).should(res => {
        expect(res.body.result.isError).to.be.eq('0')
      })
    })
  }

  static checkErc20TokenBalance(
    tokenAddress: string,
    balanceBefore: number,
    transactionValue: number,
    shouldBeEqual: boolean,
    walletAddress = AddressesEnum.WALLET_PUBLIC,
    retries = 0
  ) {
    const expectedTransactionValue: number = transactionValue * Math.pow(10, 18)
    cy.log('Checking token balance from ETHERSCAN API')
    EtherscanFacade.erc20TokenBalance(tokenAddress, walletAddress).should(res => {
      console.log('ACTUAL ERC 20 TOKEN BALANCE FROM ETHERSCAN', res)
      console.log('EXPECTED TRANSACTION VALUE', expectedTransactionValue)
      console.log('EXPECTED BALANCE AFTER', balanceBefore + expectedTransactionValue)
      try {
        if (shouldBeEqual) {
          expect(parseInt(res.body.result)).to.be.eq(balanceBefore + expectedTransactionValue)
        }
        expect(parseInt(res.body.result)).to.be.at.least(balanceBefore + expectedTransactionValue)
      } catch (err) {
        if (retries > 100) {
          throw new Error('Retried too many times to check erc20 token balance from etherscan')
        }
        cy.wait(1000)
        return this.checkErc20TokenBalance(
          tokenAddress,
          balanceBefore,
          transactionValue,
          shouldBeEqual,
          walletAddress,
          ++retries
        )
      }
    })
  }
  static checkSubgraphTransaction(
    expectedToken0Symbol: string,
    expectedToken1Symbol: string,
    expectedValueOut: number,
    expectedValueIn: number
  ) {
    cy.window().then(() => {
      ;(SubgraphFacade.transaction(TransactionHelper.getTxFromStorage()) as Cypress.Chainable).then(
        (res: Transaction) => {
          console.log('SUBGRAPH RESPONSE', res.body)

          const firstSwap = res.body.data.transactions[0].swaps[0]

          expect(firstSwap.pair.token0.symbol).to.be.eq(expectedToken0Symbol || expectedToken1Symbol)
          expect(firstSwap.pair.token1.symbol).to.be.eq(expectedToken1Symbol || expectedToken0Symbol)

          const amountIn: number = parseFloat(firstSwap.amount1In) + parseFloat(firstSwap.amount0In)
          const amountOut: number = parseFloat(firstSwap.amount1Out) + parseFloat(firstSwap.amount0Out)

          console.log('EXPECTED AMOUNT OUT: ', amountOut)
          console.log('EXPECTED AMOUNT IN: ', amountIn)

          expect(amountIn).to.be.eq(expectedValueIn)
          expect(amountOut).to.be.greaterThan(expectedValueOut)
        }
      )
    })
  }

  static getTxFromStorage() {
    console.log('tx', Object.keys(JSON.parse(localStorage.getItem('swapr_transactions')!)[4])[0])
    return Object.keys(JSON.parse(localStorage.getItem('swapr_transactions')!)[4])[0]
  }

  static checkEthereumBalanceFromEtherscan(
    expectedBalance: number,
    expectedGasCost: number,
    walletAddress = AddressesEnum.WALLET_PUBLIC,
    retries = 0
  ) {
    console.log('EXPECTED BALANCE WITHOUT GAS: ', expectedBalance, typeof expectedBalance)
    expectedBalance -= expectedGasCost * Math.pow(10, 18)
    console.log('EXPECTED BALANCE: ', expectedBalance)
    cy.window().then(() => {
      EtherscanFacade.transaction(TransactionHelper.getTxFromStorage()).then(res => {
        console.log('ETHSC: ', res)
      })
    })

    EtherscanFacade.ethBalance(walletAddress).then((response: { body: { result: string } }) => {
      console.log('ETHERSCAN RESPONSE: ', response)
      try {
        expect(parseFloat(response.body.result)).to.be.greaterThan(expectedBalance) //gas fee
      } catch (err) {
        if (this.retries > 100) {
          throw new Error('Retried too many times when checking eth balance from etherscan')
        }
        cy.wait(1000)
        return this.checkEthereumBalanceFromEtherscan(expectedBalance, expectedGasCost, walletAddress, ++retries)
      }
    })
  }

  static waitForTokenLists(retries = 0) {
    cy.intercept('GET', 'https://ipfs.io/ipfs/**').as('somere')
    cy.wait('@somere').then(req => {
      try {
        expect(req.response).to.not.be.undefined
        expect(req.response!.body.name).to.be.eq('Swapr token list')
      } catch (err) {
        if (retries > 100) {
          throw new Error('To many retries when waiting for token lists')
        }
        this.waitForTokenLists(++retries)
      }
    })
  }
}
