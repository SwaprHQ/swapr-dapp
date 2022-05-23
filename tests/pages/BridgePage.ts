export class BridgePage {
  static visitBridgePage() {
    cy.visit('/#/bridge')
  }
  static getNetworkFromSelector() {
    return cy.get('[data-testid=from-network-selector]')
  }
  static getNetworkToSelector() {
    return cy.get('[data-testid=to-network-selector]')
  }
  static getBridgeButton() {
    return cy.get('[data-testid=bridge-button]')
  }
  static getTransactionValueInput() {
    return cy.get('[data-testid=transaction-value-input]')
  }
  static getSelectTokenButton() {
    return cy.get('[data-testid=select-token-button]')
  }
  static getBridgeSelector(bridgeName: string) {
    return cy.get('[data-testid=' + bridgeName + '-bridge]')
  }
  static getBridgedAmount() {
    return cy.get('[data-testid=bridge-amount')
  }
  static confirmBridging() {
    return cy.get('[data-testid=accept-bridging').click()
  }
}
