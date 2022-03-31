import { LiquidityPage } from '../../../pages/LiquidityPage'

describe('Check Liquidity Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/#/pools?chainId=1')
  })

  it('Check All Pairs button and campaigns/my pairs toggle switch on Liquidity Page', () => {
    LiquidityPage.allPairsButton().should('be.visible')
    LiquidityPage.campaignsAndMyPairsToggleSwitch().should('be.visible')
  })

  it('Check Create Pair button and modal window on Liquidity Page', () => {
    LiquidityPage.createPairButton().should('be.visible')
    LiquidityPage.createPairButton().click()
    LiquidityPage.inputFields().should('be.visible')
    LiquidityPage.selectTokenButton().should('be.visible')
  })

  it('Check Select Token modal window on Liquidity Page', () => {
    LiquidityPage.createPairButton().click()
    LiquidityPage.createAPairInputField().should('be.visible')
    LiquidityPage.selectTokenButton()
      .first()
      .click()
    LiquidityPage.tokenSearchField().should('be.visible')
  })
})
