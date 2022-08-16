import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { MetamaskNetworkHandler } from '../../../../utils/MetamaskNetworkHandler'

describe.skip('Wrapping tests', () => {
  before(() => {
    MetamaskNetworkHandler.addGnosis()
  })

  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
    cy.changeMetamaskNetwork('rinkeby')
  })
  after(() => {
    cy.changeMetamaskNetwork('rinkeby')
    cy.resetMetamaskAccount()
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.wait(1000)
  })

  it.only('Should wrap ETH to WETH [TC-03]', () => {
    MetamaskNetworkHandler.switchToRinkebyIfNotConnected()
    cy.wait(10007567567567)
  })
})
