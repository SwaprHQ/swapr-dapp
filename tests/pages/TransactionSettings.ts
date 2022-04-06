export class TransactionSettings  {
    static visitSwapPage() {
        cy.visit('/swap')
      }
    static settings_Button() {
      return  cy.get('[id=open-settings-dialog-button]')
    }
    static multihop_Text() {
        return  cy.get('[data-testid=multihop-text]')
    }
    static slippageTolerance_Text() {
        return  cy.get('[data-testid=slippage-tolerance-text]')
    }
    static preferredGasPrice_Text() {
        return  cy.get('[data-testid=preferred-gas-price-text]')
    }
    static transactionDeadline_Text() {
        return  cy.get('[data-testid=transaction-deadline-text]')
    }
    static toggleExpertMode_Text() {
        return  cy.get('[data-testid=toggle-expert-mode-text]')
    }
    static about_Hyperlink() {
        return  cy.get('[data-testid=about-hyperlink]')
    }
    static code_Hyperlink() {
        return  cy.get('[data-testid=code-hyperlink]')
    }
    static discord_Hyperlink() {
        return  cy.get('[data-testid=discord-hyperlink]')
    }
    static on_ToggleButton() {
        return  cy.get('[data-testid=toggle-on]')
    }
    static off_ToggleButton() {
        return  cy.get('[data-testid=toggle-off]')
    }
    static slippageTolerance_Field() {
        return  cy.get('[data-testid=input-slippage-tolerance]')
    }
    static gasPrice_Field() {
        return  cy.get('[data-testid=input-gas-price]')
    }
    static transactionDeadline_Field() {
        return  cy.get('[data-testid=input-transaction-deadline]')
    }
    static expertModeConfirmation_modalWindow() {
        return  cy.get('[data-testid=expert-mode-confirmation-window]')
    }
    static enterValid_errorMesssage() {
        return  cy.get('[data-testid=slippage-error]')
    }
    static typeSlippageTolerance_Field(value: string) {
        this.slippageTolerance_Field().type(value)
        return this
    }
    static typeGasPrice_Field(value: string) {
        this.gasPrice_Field().type(value)
        return this
      }
      
  }  