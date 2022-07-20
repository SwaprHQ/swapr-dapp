import { MenuBar } from './MenuBar'

export class TransactionSettings {
  static visitTransactionSettingsPage() {
    cy.visit('/#/swap')
  }
  static getSettingsButton() {
    return cy.get('[id=open-settings-dialog-button]')
  }
  static getMultihopText() {
    return cy.get('[data-testid=multihop-text]')
  }
  static getSlippageToleranceText() {
    return cy.get('[data-testid=slippage-tolerance-text]')
  }
  static getTransactionDeadlineText() {
    return cy.get('[data-testid=transaction-deadline-text]')
  }
  static getToggleExpertModeText() {
    return cy.get('[data-testid=toggle-expert-mode-text]')
  }
  static getAboutHyperlink() {
    return cy.get('[data-testid=about-hyperlink]')
  }
  static getCodeHyperlink() {
    return cy.get('[data-testid=code-hyperlink]')
  }
  static getDiscordHyperlink() {
    return cy.get('[data-testid=discord-hyperlink]')
  }
  static getOnToggleButton() {
    return cy.get('[data-testid=toggle-on]')
  }
  static getOffToggleButton() {
    return cy.get('[data-testid=toggle-off]')
  }
  static getSlippageToleranceField() {
    return cy.get('[data-testid=input-slippage-tolerance]')
  }
  static getTransactionDeadlineField() {
    return cy.get('[data-testid=input-transaction-deadline]')
  }
  static getExpertModeConfirmationModalWindow() {
    return cy.get('[data-testid=expert-mode-confirmation-window]')
  }
  static getEnterValiErrorMesssage() {
    return cy.get('[data-testid=slippage-error]')
  }
  static getExpertModeButton() {
    return cy.get('#toggle-expert-mode-button')
  }
  static switchExpertModeOn() {
    this.getExpertModeButton().within(() => {
      cy.get('[data-testid=toggle-on]').click()
    })
    cy.get('#confirm-expert-mode').click()
  }
  static switchExpertModeOff() {
    this.getExpertModeButton().within(() => {
      cy.get('[data-testid=toggle-off]').click()
    })
  }
  static typeSlippageTolerance(value: string) {
    this.getSlippageToleranceField().type(value)
    return this
  }
  static setMultihopOff() {
    cy.get('[data-testid=multihop-icon]').trigger('mouseover')
    cy.get('[data-testid=popover]')
      .contains('Multihop')
      .then(element => {
        if (element.text() === 'Multihop enabled') {
          MenuBar.getSettings().click()
          cy.get('[data-testid=toggle-off]').first().click()
          TransactionSettings.closeModal()
        }
      })
  }
  static closeModal() {
    cy.get('body').click(0, 0)
  }
}
