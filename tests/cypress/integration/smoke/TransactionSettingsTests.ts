import { SwapPage } from '../../../pages/SwapPage'
import { TransactionSettings } from '../../../pages/TransactionSettings'

describe('Transactions Settings Smoke Test', () => {
  before(() => {
    SwapPage.visitSwapPage()
  })
  it('Open Transaction settings modal window', () => {
    TransactionSettings.getSettingsButton().should('be.visible')
    TransactionSettings.getSettingsButton().click()
  })
  it('Check All ellements and buttons on Transaction settings window [TC-48]', () => {
    TransactionSettings.getMultihopText().should('be.visible')
    TransactionSettings.getSlippageToleranceText().should('be.visible')
    TransactionSettings.getToggleExpertModeText().should('be.visible')
    TransactionSettings.getAboutHyperlink().should('be.visible')
    TransactionSettings.getCodeHyperlink().should('be.visible')
    TransactionSettings.getDiscordHyperlink().should('be.visible')
    TransactionSettings.getOnToggleButton().eq(0).should('be.visible')
    TransactionSettings.getOnToggleButton().eq(1).should('be.visible')
    TransactionSettings.getOffToggleButton().eq(0).should('be.visible')
    TransactionSettings.getOffToggleButton().eq(1).should('be.visible')
    TransactionSettings.getSlippageToleranceField().should('be.visible')
    TransactionSettings.getTransactionDeadlineField().should('be.visible')
  })
  it('Check Code hyperlink [TC-49]', () => {
    TransactionSettings.getCodeHyperlink()
      .should('have.attr', 'href')
      .and('include', 'https://github.com/ImpeccableHQ/swapr-dapp')
  })
  it('Check Discord hyperlink [TC-49]', () => {
    TransactionSettings.getDiscordHyperlink()
      .should('have.attr', 'href')
      .and('include', 'https://discord.com/invite/4QXEJQkvHH')
  })
  //TODO investigate why cypress consider this element as unvisible
  it.skip('Should not allow to type not numbers into Slippage Tolerance Field input [TC-50]', () => {
    TransactionSettings.typeSlippageTolerance('!#$%^&*(*)_qewruip')
    TransactionSettings.getEnterValiErrorMesssage().should('be.visible')
  })
})
