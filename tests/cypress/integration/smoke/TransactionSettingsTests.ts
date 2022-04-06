  import { TransactionSettings } from '../../../pages/TransactionSettings'

  describe('Transactions Settings Smoke Test', () => {
      before(() => {
        cy.visit('http://localhost:3000/#/swap?chainId=1')
      })
      it('Open Transaction settings modal window', () => {
          TransactionSettings.settings_Button().should('be.visible')
          TransactionSettings.settings_Button().click()
      })
      it('Check All ellements and buttons on Transaction settings window [TC-48]', () => {
        TransactionSettings.multihop_Text().should('be.visible')
        TransactionSettings.slippageTolerance_Text().should('be.visible')
        TransactionSettings.preferredGasPrice_Text().should('be.visible')
        TransactionSettings.toggleExpertMode_Text().should('be.visible')
        TransactionSettings.about_Hyperlink().should('be.visible')
        TransactionSettings.code_Hyperlink().should('be.visible')
        TransactionSettings.discord_Hyperlink().should('be.visible')
        TransactionSettings.on_ToggleButton().eq(0).should('be.visible')
        TransactionSettings.on_ToggleButton().eq(1).should('be.visible')
        TransactionSettings.off_ToggleButton().eq(0).should('be.visible')
        TransactionSettings.off_ToggleButton().eq(1).should('be.visible')
        TransactionSettings.slippageTolerance_Field().should('be.visible')
        TransactionSettings.gasPrice_Field().should('be.visible')
        TransactionSettings.transactionDeadline_Field().should('be.visible')
      })
      it('Check About hyperlink [TC-49]', () => {
        TransactionSettings.about_Hyperlink()
        .should('have.attr', 'href')
        .and('include', 'https://dxdao.eth.link/')
      })
      it('Check Code hyperlink [TC-49]', () => {
        TransactionSettings.code_Hyperlink()
        .should('have.attr', 'href')
        .and('include', 'https://github.com/levelkdev/dxswap-dapp')
      })
      it('Check Discord hyperlink [TC-49]', () => {
        TransactionSettings.discord_Hyperlink()
        .should('have.attr', 'href')
        .and('include', 'https://discord.com/invite/4QXEJQkvHH')
      })
      it('Should not allow to type not numbers into Slippage Tolerance Field input [TC-50]', () => {
        TransactionSettings.typeSlippageTolerance_Field('!#$%^&*(*)_qewruip')
        TransactionSettings.enterValid_errorMesssage().should('be.visible')
      })
      it('Should not allow to type not numbers into Gas Price Field input [TC-50]', () => {
        TransactionSettings.typeGasPrice_Field('!#$%^&*(*)_qewruip')
        TransactionSettings.enterValid_errorMesssage().should('be.visible')
      })
    })