import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import {NetworkSwitcher} from "../../../pages/NetworkSwitcher";

describe('Wallet connection tests', () => {
  beforeEach(() => {
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearCookies()
    cy.clearLocalStorage()
  })
  after(()=>{
    cy.changeMetamaskNetwork('rinkeby')
  })

  it('Should display that wallet is connected to rinkeby [TC-01]', () => {
    MenuBar.getWeb3Status().should('be.visible')
    MenuBar.getNetworkSwitcher().should('contain.text', 'Rinkeby')
  })
  it('Should display that wallet is not connected to rinkeby', () => {
    cy.disconnectMetamaskWalletFromAllDapps()
    SwapPage.getConnectOrSwitchButton().should("be.visible")
    SwapPage.getConnectOrSwitchButton().should("be.visible")
  })
  it('Should display that Ropsten network isnt supported', () => {
    cy.changeMetamaskNetwork('ropsten')
    MenuBar.getUnsupportedNetworkWarning().should("be.visible")
    MenuBar.getUnsupportedNetworkPopover().should("be.visible")
  })
  it('Should switch from  unsupported network to mainet wallet', () => {
    cy.changeMetamaskNetwork('ropsten')
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.ethereum().click()
    cy.allowMetamaskToSwitchNetwork()
    MenuBar.getNetworkSwitcher().should("contain.text", "Ethereum")
  })
  it('Should switch from mainet to a. rinkeby by dapp', () => {
    cy.changeMetamaskNetwork('ethereum')
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.arinkeby().click()
    cy.allowMetamaskToAddAndSwitchNetwork()
    MenuBar.getNetworkSwitcher().should("contain.text", "Arbitrum Rinkeby")
  })
  it('Should switch from mainet to gnosis by dapp', () => {
    cy.changeMetamaskNetwork('ethereum')
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.gnosis().click()
    cy.allowMetamaskToAddAndSwitchNetwork()
    MenuBar.getNetworkSwitcher().should("contain.text", "Gnosis")
  })
  it('Should switch from mainet to arbitrum by dapp', () => {
    cy.changeMetamaskNetwork('ethereum')
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.arbitrum().click()
    cy.allowMetamaskToAddAndSwitchNetwork()
    MenuBar.getNetworkSwitcher().should("contain.text", "Arbitrum One")
  })
  it('Should switch from mainet to rinkeby by dapp', () => {
    cy.changeMetamaskNetwork('ethereum')
    MenuBar.getNetworkSwitcher().click()
    NetworkSwitcher.rinkeby().click()
    cy.allowMetamaskToSwitchNetwork()
    MenuBar.getNetworkSwitcher().should("contain.text", "Rinkeby")
  })
})
