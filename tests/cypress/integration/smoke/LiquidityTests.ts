import { LiquidityPage } from '../../../pages/LiquidityPage'

describe('Check Liquidity Page', () => {
  beforeEach(() => {
  LiquidityPage.visitLiquidityPage()
  })

  it('Check All Pairs button and campaigns/my pairs toggle switch on Liquidity Page', () => {
    LiquidityPage.getAllPairsButton().should('be.visible')
    LiquidityPage.getCampaignsAndMyPairsToggleSwitch().should('be.visible')
  })

  it('Check Create Pair button and modal window on Liquidity Page', () => {
    LiquidityPage.getCreatePairButton().should('be.visible')
    LiquidityPage.getCreatePairButton().click()
    LiquidityPage.getInputFields().should('be.visible')
    LiquidityPage.getSelectTokenButton().should('be.visible')
  })

  it('Check Select Token modal window on Liquidity Page', () => {
    LiquidityPage.getCreatePairButton().click()
    LiquidityPage.getCreateAPairInputField().should('be.visible')
    LiquidityPage.getSelectTokenButton()
      .first()
      .click()
    LiquidityPage.getTokenSearchField().should('be.visible')
  })
})
