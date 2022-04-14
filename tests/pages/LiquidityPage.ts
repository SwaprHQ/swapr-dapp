export class LiquidityPage {
  static visitSwapPage() {
    cy.visit('/pools?chainId=1')
  }

  static allPairsButton() {
    return cy.get('[data-testid=all-token-list]')
  }
  static createPairButton() {
    return cy.get('[data-testid=create-pair]')
  }
  static campaignsAndMyPairsToggleSwitch() {
    return cy.get('[data-testid=campaigns-toggle]')
  }
  static inputFields() {
    return cy.get('[data-testid=transaction-value-input]')
  }
  static selectTokenButton() {
    return cy.get('[data-testid=select-token-button]')
  }
  static createAPairInputField() {
    return cy.get('[data-testid=select-token-button]')
  }
  static tokenSearchField() {
    return cy.get('[id=token-search-input]')
  }
}
