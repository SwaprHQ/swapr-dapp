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
  static getStatusTag(timeoutValue: number) {
    return cy.get('[data-testid=status-tag', { timeout: timeoutValue })
  }
  static getBridgingInitiatedModal() {
    return cy.get('[data-testid=bridge-initiated-modal]')
  }
  static closeBridgeInitiatedModal() {
    return cy.get('[data-testid=close-bridge-initiated-button]').click()
  }
  static getBridgedAssetName() {
    return cy.get('[data-testid=bridged-asset-name]')
  }
  static getBridgedFromChain() {
    return cy.get('[data-testid=bridged-from-chain]')
  }
  static getBridgedToChain() {
    return cy.get('[data-testid=bridged-to-chain]')
  }
  static getTokenSymbol() {
    return cy.get('[data-testid=token-symbol]')
  }
}
