import { MenuBar } from '../../../pages/MenuBar'
import { TokenMenu } from '../../../pages/TokenMenu'
import { BridgePage } from '../../../pages/BridgePage'
import { NetworkSwitcher } from '../../../pages/NetworkSwitcher'
import { AddressesEnum } from '../../../utils/enums/AddressesEnum'
import 'cypress-ethereum-provider'
import Web3 from "web3"

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
    const provider = require('cypress-ethereum-provider')
    window.web3 = new Web3(provider(['injected', 'wss://rinkeby.infura.io/ws/v3/${INFURA_ID}']))

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
    BridgePage.confirmBridging()
    cy.wait(5000)
    cy.confirmMetamaskTransaction({})
    console.log(web3.eth.getBalance(AddressesEnum.WALLET_PUBLIC))
    cy.wait(1000000000)
  })
})
