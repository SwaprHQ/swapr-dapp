import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import { LiquidityPage } from '../../../pages/LiquidityPage'

describe('Add liquidity', () => {
  const TRANSACTION_VALUE: number = 0.000001
  let firstTokenBefore: number
  let secondTokenBefore: number
  let firstTokenAfter: number
  let secondTokenAfter: number
  let firstTokenRemovedAmount: number = TRANSACTION_VALUE
  let secondTokenRemovedAmount: number
  let firstTokenBalance: number = 0
  let secondTokenBalance: number = 0

  before(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
  })

  it('Should get balance of tokens from liquidity pool [TC-59]', () => {
    MenuBar.getLiquidity().click()
    LiquidityPage.getPairCards()
    .contains('DXD')
    .contains('WEENUS')
    .click()
    LiquidityPage.getFirstTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('FIRST TOKEN BALANCE: ', res)
        firstTokenBefore = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('FIRST TOKEN BALANCE: ', firstTokenBefore)
    })
    LiquidityPage.getSecondTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('SECOND TOKEN BALANCE: ', res)
        secondTokenBefore = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('SECOND TOKEN BALANCE: ', secondTokenBefore)
    })
  })
  it('Should Remove tokens from liquidity pool [TC-59]', () => {
    LiquidityPage.getRemoveLiquidityButton().click()
    LiquidityPage.typeValueToFirstToken(TRANSACTION_VALUE.toFixed(9).toString())
    console.log('FIST TOKEN ADDED AMOUNT', firstTokenRemovedAmount)
    LiquidityPage.getSecondTokenField()
      .invoke('val')
      .should(value => {
        console.log('SECOND TOKEN ADDED AMOUNT', value)
        secondTokenRemovedAmount = parseFloat(value as string)
        firstTokenBalance = firstTokenBefore + firstTokenRemovedAmount
        console.log('FINAL FIRST TOKEN BALANCE', firstTokenBalance)      
        secondTokenBalance = secondTokenBefore + secondTokenRemovedAmount
        console.log('FINAL SECOND TOKEN BALANCE', secondTokenBalance)
      })
    LiquidityPage.getSupplyButton().click()
    LiquidityPage.getConfirmSupplyButton().click()
    cy.confirmMetamaskTransaction({})
    LiquidityPage.getCloseTransactionSubmittedWindowButton().click()
    MenuBar.checkToastMessage('Add')
  })
  it('Should check if tokens are removed from liquidity pool [TC-59]', () => {
    MenuBar.getLiquidity().click()
    LiquidityPage.getPairCards()
    .contains('DXD')
    .contains('WEENUS')
    .click()
    LiquidityPage.getFirstTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('FIRST TOKEN BALANCE AFTER: ', res)
        firstTokenAfter = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('FIRST TOKEN BALANCE AFTER: ', firstTokenAfter)
    })
    LiquidityPage.getSecondTokenBalance()
      .invoke('text')
      .should(res => {
        expect(parseFloat(res)).be.greaterThan(0)
        console.log('SECOND TOKEN BALANCE AFTER: ', res)
        secondTokenAfter = parseFloat(res)
      })
    cy.wrap(null).then(() => {
      console.log('SECOND TOKEN BALANCE AFTER: ', secondTokenAfter)
      if (firstTokenBalance.toFixed(3) === firstTokenAfter.toFixed(3)) {
        console.log('SUM OF THE FIRST TOKEN BALANCE IS OK')
      } else {
        console.log('NOT GOOD SUM OF THE FIRST TOKEN BALANCE')
      }
      if (secondTokenBalance.toFixed(3) === secondTokenAfter.toFixed(3)) {
        console.log('SUM OF THE SECOND TOKEN BALANCE IS OK')
      } else {
        console.log('NOT GOOD SUM OF THE SECOND TOKEN BALANCE')
      }
      expect(firstTokenBalance.toFixed(3)).to.be.eq(firstTokenAfter.toFixed(3))
      expect(secondTokenBalance.toFixed(3)).to.be.eq(secondTokenAfter.toFixed(3))
    })
  })
})