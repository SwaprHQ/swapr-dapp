export class LiquidityPage {
  static visitLiquidityPage() {
    cy.visit('/#/pools')
  }

  static getAllPairsButton() {
    return cy.get('[data-testid=all-token-list]')
  }
  static getCreatePairButton() {
    return cy.get('[data-testid=create-pair]')
  }
  static getCampaignsAndMyPairsToggleSwitch() {
    return cy.get('[data-testid=campaigns-toggle]')
  }
  static getInputFields() {
    return cy.get('[data-testid=transaction-value-input]')
  }
  static getSelectTokenButton() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getCreateAPairInputField() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getTokenSearchField() {
    return cy.get('[id=token-search-input]')
  }
}
