import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { MetamaskNetworkHandler } from '../../../../utils/MetamaskNetworkHandler'

describe('Wallet connection tests', () => {
  before(() => {
    MetamaskNetworkHandler.switchToRinkebyIfNotConnected()
  })
  beforeEach(() => {
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearCookies()
    cy.clearLocalStorage()
  })
  after(() => {
    cy.changeMetamaskNetwork('rinkeby')
    MenuBar.getWeb3Status().should('not.exist')
  })

  it('Should display that wallet is connected to rinkeby [TC-01]', () => {
    MenuBar.getWeb3Status().should('be.visible')
  })
  it('Should display that wallet is not connected to rinkeby', () => {
    cy.disconnectMetamaskWalletFromAllDapps()
    SwapPage.getConnectOrSwitchButton().should('be.visible')
  })
})
