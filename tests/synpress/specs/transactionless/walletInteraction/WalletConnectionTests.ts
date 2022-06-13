import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'

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
    MenuBar.getWeb3Status().should("not.exist", "Rinkeby")
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
})
