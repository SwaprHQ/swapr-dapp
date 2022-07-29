import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { AddressesEnum } from '../../../../utils/enums/AddressesEnum'
import { ScannerFacade } from '../../../../utils/facades/ScannerFacade'
import { TransactionHelper } from '../../../../utils/TransactionHelper'
import { NetworkAdder } from '../../../../utils/NetworkAdder'

describe('Wrapping tests', () => {
  before(() => {
    NetworkAdder.addGnosis()
  })

  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  after(() => {
    cy.changeMetamaskNetwork('rinkeby')
    cy.resetMetamaskAccount()
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.wait(1000)
  })

  it('Should wrap ETH to WETH [TC-03]', () => {})
})
