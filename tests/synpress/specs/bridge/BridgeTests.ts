import { MenuBar } from '../../../pages/MenuBar'
import { TokenMenu } from '../../../pages/TokenMenu'
import { BridgePage } from '../../../pages/BridgePage'
import { NetworkSwitcher } from '../../../pages/NetworkSwitcher'
import { AddressesEnum } from '../../../utils/enums/AddressesEnum'
import { ArbiscanFacade } from '../../../utils/facades/ArbiscanFacade'

describe('Bridge tests', () => {
  before(() => {
    BridgePage.visitBridgePage()
    MenuBar.connectWallet()
  })
  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
    cy.wait(500)
  })
  it('Should open a campaign through liquidity pair [TC-60]', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getBridgeButton().should('contain.text', 'Enter amount')
    BridgePage.getTransactionValueInput().type('0.00001')
    BridgePage.getSelectTokenButton().click()
    TokenMenu.chooseToken('usdc')
    BridgePage.getBridgeButton().should('contain.text', 'Select bridge below')
    BridgePage.getBridgeSelector('arbitrum').should('be.visible')
    BridgePage.getBridgedAmount().should('contain.text', '0.00')
    BridgePage.getBridgeSelector('arbitrum').click()
    BridgePage.getBridgeButton()
      .should('contain.text', 'Bridge to')
      .click()
    BridgePage.confirmBriding()
    cy.wait(5000)
    cy.confirmMetamaskTransaction({ gasFee: 10, gasLimit: 1000000 })
    ArbiscanFacade.erc20TokenBalance(AddressesEnum.USDC_TOKEN_ARINKEBY).then(res => {
      console.log(res)
    })
    cy.wait(100000)
  })
})
