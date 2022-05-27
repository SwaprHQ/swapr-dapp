export class NetworkSwitcher {
  static ethereum() {
    return cy.get('[data-testid=ethereum-network-button]').filter(':visible')
  }
  static arbitrum() {
    return cy.get('[data-testid=arbitrum-one-network-button]').filter(':visible')
  }
  static gnosis() {
    return cy.get('[data-testid=gnosis-chain-network-button]').filter(':visible')
  }
  static rinkeby() {
    return cy.get('[data-testid=rinkeby-network-button]').filter(':visible')
  }
  static arinkeby() {
    return cy.get('[data-testid=a-rinkeby-network-button]').filter(':visible')
  }
  static getNetworkSwitcher() {
    return cy.get('[data-testid=network-switcher]').filter(':visible')
  }
  static polygon() {
    return cy.get('[data-testid=polygon-network-button]')
  }
}
