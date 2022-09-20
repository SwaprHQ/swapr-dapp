import { ChainsEnum } from '../utils/enums/ChainsEnum'

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
    return cy
      .get('[data-testid=a-rinkeby-network-button]')
      .filter(':visible')
      .should(element => {
        expect(element.length).to.be.eq(1)
      })
  }
  static getNetworkSwitcher() {
    return cy.get('[data-testid=network-switcher]').filter(':visible')
  }
  static polygon() {
    return cy.get('[data-testid=polygon-network-button]').filter(':visible')
  }
  static checkNetwork(networkId: ChainsEnum) {
    cy.window().should(win => {
      expect((window as any).ethereum.networkVersion).to.be.eq(networkId)
    })
  }
}
