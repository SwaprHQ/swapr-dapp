export class LiquidityPage {
  static visitSwapPage() {
    cy.visit('/pools?chainId=1')
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
