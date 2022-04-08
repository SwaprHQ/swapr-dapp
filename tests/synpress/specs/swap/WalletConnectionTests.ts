import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import { AddressesEnum } from '../../../utils/AddressesEnum'
import { EtherscanFacade } from '../../../utils/EtherscanFacade'
import { TransactionHelper } from '../../../utils/TransactionHelper'

describe('Wallet connection tests', () => {
    beforeEach(() => {
        SwapPage.visitSwapPage()
    })
    afterEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps()
    })

    it('Should display that wallet is connected to rinkeby [TC-01]', () => {
        MenuBar.connectWallet()
        MenuBar.getWeb3Status().should('be.visible')
        MenuBar.getNetworkSwitcher().should('contain.text', 'Rinkeby')
    })
})
