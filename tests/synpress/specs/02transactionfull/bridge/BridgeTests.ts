import { MenuBar } from '../../../../pages/MenuBar'
import { TokenMenu } from '../../../../pages/TokenMenu'
import { BridgePage } from '../../../../pages/BridgePage'
import { NetworkSwitcher } from '../../../../pages/NetworkSwitcher'
import { AddressesEnum } from '../../../../utils/enums/AddressesEnum'
import { ScannerFacade, SCANNERS } from '../../../../utils/facades/ScannerFacade'
import { ChainsEnum } from '../../../../utils/enums/ChainsEnum'
import { ErrorModal } from '../../../../pages/ErrorModal'
import { MetamaskNetworkHandler } from '../../../../utils/MetamaskNetworkHandler'

describe('Bridge tests', () => {
  let balanceBefore: number
  const TRANSACTION_VALUE = 1

  before(() => {
    ScannerFacade.erc20TokenBalance(
      AddressesEnum.USDC_TOKEN_ARINKEBY,
      AddressesEnum.WALLET_PUBLIC,
      SCANNERS.ARBISCAN
    ).then((res: { body: { result: string } }) => {
      balanceBefore = parseFloat(res.body.result)
      console.log('ERC20 BALANCE BEFORE: ', balanceBefore)
      console.log('ERC20 BALANCE BEFORE: ', res)
    })
    MetamaskNetworkHandler.addGnosis()
    BridgePage.visitBridgePage()
    MenuBar.connectWallet()
    MetamaskNetworkHandler.switchToRinkebyIfNotConnected()
  })
  after(() => {
    cy.changeMetamaskNetwork('rinkeby')
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.resetMetamaskAccount()
    cy.wait(500)
  })

  it('Should initiate a bridging ', function () {
    if (isNaN(balanceBefore)) {
      this.skip() // Skipping test if Arbiscan is down
    }
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getBridgeButton().should('contain.text', 'Enter amount')
    BridgePage.getTransactionValueInput().type(String(TRANSACTION_VALUE))
    BridgePage.getSelectTokenButton().click()
    TokenMenu.searchAndChooseToken('usdc')
    BridgePage.getBridgeButton().should('contain.text', 'Select bridge below')
    BridgePage.getBridgeSelector('arbitrum').scrollIntoView().should('be.visible')
    BridgePage.getBridgedAmount().should('contain.text', String(TRANSACTION_VALUE))
    BridgePage.getBridgeSelector('arbitrum').click()
    BridgePage.getBridgeButton().should('contain.text', 'Bridge to').click()
    BridgePage.confirmBridging()
    cy.wait(5000) //METAMASK MODAL IS OPENING WITH 5 SEC DELAY WHICH IS TOO LONG FOR SYNPRESS
    cy.confirmMetamaskTransaction({})
    BridgePage.getBridgingInitiatedModal().should('contain.text', 'Bridging Initiated')
    BridgePage.closeBridgeInitiatedModal()
    BridgePage.getStatusTag(600000).should('contain.text', 'Pending')
    BridgePage.getBridgedFromChain().should('contain.text', 'Rinkeby')
    BridgePage.getBridgedToChain().should('contain.text', 'A. Rinkeby')
    BridgePage.getBridgedAssetName().should('contain.text', '1 USDC')
  })
  it('Should display transaction rejected when rejecting bridging in wallet ', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getBridgeButton().should('contain.text', 'Enter amount')
    BridgePage.getTransactionValueInput().type(String(TRANSACTION_VALUE))
    BridgePage.getSelectTokenButton().click()
    TokenMenu.searchAndChooseToken('usdc')
    BridgePage.getBridgeButton().should('contain.text', 'Select bridge below')
    BridgePage.getBridgeSelector('arbitrum').scrollIntoView().should('be.visible')
    BridgePage.getBridgedAmount().should('contain.text', String(TRANSACTION_VALUE))
    BridgePage.getBridgeSelector('arbitrum').click()
    BridgePage.getBridgeButton().click()
    BridgePage.confirmBridging()
    cy.wait(5000) //METAMASK MODAL IS OPENING WITH 5 SEC DELAY WHICH IS TOO LONG FOR SYNPRESS
    cy.rejectMetamaskTransaction()
    ErrorModal.getTransactionErrorModal().scrollIntoView().should('be.visible').should('contain.text', 'rejected')
    BridgePage.closeTransactionErrorModal()
    BridgePage.getNetworkFromSelector().scrollIntoView().should('be.visible')
    BridgePage.getNetworkToSelector().scrollIntoView().should('be.visible')
  })
  it('Should select ethereum and select others networks as to', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.ethereum().click()
    BridgePage.getBridgeButton().should('contain.text', 'Connect to Ethereum').click()
    cy.allowMetamaskToSwitchNetwork()
    NetworkSwitcher.checkNetwork(ChainsEnum.MAINNET)
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arbitrum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Arbitrum one')

    BridgePage.getSelectTokenButton().click()
    TokenMenu.searchAndChooseToken('eth')
    BridgePage.getTokenSymbol().should('contain.text', 'ETH')

    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.gnosis().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Gnosis Chain')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Rinkeby')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Should select Arbitrum and select others networks as to', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.arbitrum().click()
    BridgePage.getBridgeButton().should('contain.text', 'Connect to Arbitrum').click()
    cy.allowMetamaskToAddAndSwitchNetwork()
    NetworkSwitcher.checkNetwork(ChainsEnum.ARBITRUM)
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.ethereum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Ethereum')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.gnosis().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Gnosis Chain')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Rinkeby')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Should select Rinkeby and select others networks as to', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getBridgeButton().should('contain.text', 'Connect to Rinkeby').click()
    cy.allowMetamaskToSwitchNetwork()
    NetworkSwitcher.checkNetwork(ChainsEnum.RINKEBY)
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.ethereum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Ethereum')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arbitrum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Arbitrum one')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.gnosis().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Gnosis Chain')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Should select Gnosis Chain and select others networks as to', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.gnosis().click()
    BridgePage.getBridgeButton().should('contain.text', 'Connect to Gnosis Chain').click()
    cy.allowMetamaskToSwitchNetwork()
    NetworkSwitcher.checkNetwork(ChainsEnum.GNOSIS)
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.ethereum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Ethereum')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arbitrum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Arbitrum one')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Rinkeby')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Should select A. Rinkeby and select others networks as to', () => {
    BridgePage.getNetworkFromSelector().click()
    NetworkSwitcher.arinkeby().click()
    BridgePage.getBridgeButton().should('contain.text', 'Connect to A. Rinkeby').click()
    cy.allowMetamaskToAddAndSwitchNetwork()
    NetworkSwitcher.checkNetwork(ChainsEnum.ARINKEBY)
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.ethereum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Ethereum')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.arbitrum().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Arbitrum one')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.gnosis().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Gnosis Chain')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.rinkeby().click()
    BridgePage.getNetworkToSelector().should('contain.text', 'Rinkeby')
  })
  it('Should switch from network based on wallet network', () => {
    cy.changeMetamaskNetwork('ethereum')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Ethereum')
    cy.changeMetamaskNetwork('arbitrum one')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Arbitrum one')
    cy.changeMetamaskNetwork('gnosis chain')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Gnosis Chain')
    cy.changeMetamaskNetwork('rinkeby')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Rinkeby')
    cy.changeMetamaskNetwork('arbitrum rinkeby')
    BridgePage.getNetworkFromSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Should display no tokens', () => {
    cy.changeMetamaskNetwork('ethereum')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Ethereum')
    cy.changeMetamaskNetwork('arbitrum one')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Arbitrum one')
    cy.changeMetamaskNetwork('gnosis chain')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Gnosis Chain')
    cy.changeMetamaskNetwork('rinkeby')
    BridgePage.getNetworkFromSelector().should('contain.text', 'Rinkeby')
    cy.changeMetamaskNetwork('arbitrum rinkeby')
    BridgePage.getNetworkFromSelector().should('contain.text', 'A. Rinkeby')
  })
  it('Reject transaction on Gnosis', () => {
    cy.changeMetamaskNetwork('gnosis chain')
    BridgePage.getNetworkToSelector().click()
    NetworkSwitcher.polygon().click()
    BridgePage.getBridgeButton().should('contain.text', 'Enter amount')
    BridgePage.getTransactionValueInput().type(String(TRANSACTION_VALUE))
    BridgePage.getSelectTokenButton().click()
    TokenMenu.chooseToken('xdai')
    BridgePage.getBridgeButton().should('contain.text', 'Select bridge below')
    BridgePage.getBridgeSelector('socket').scrollIntoView().should('be.visible')
    BridgePage.getBridgedAmount().should(res => {
      expect(parseFloat(res.text())).to.be.greaterThan(0)
    })
    BridgePage.getBridgeSelector('socket').click()
    BridgePage.getBridgeButton().should('contain.text', 'Bridge to').click()
    BridgePage.confirmBridging()
    cy.wait(5000)
    cy.rejectMetamaskTransaction()

    ErrorModal.getTransactionErrorModal().should('be.visible').should('contain.text', 'rejected')
    ErrorModal.closeTransactionErrorModal()
  })
  it('Should display history of bridge', function () {
    if (isNaN(balanceBefore)) {
      this.skip()
    }
    cy.changeMetamaskNetwork('rinkeby')
    BridgePage.getStatusTag(600000).should('contain.text', 'Confirmed')
    BridgePage.getBridgedFromChain().should('contain.text', 'Rinkeby')
    BridgePage.getBridgedToChain().should('contain.text', 'A. Rinkeby')
    BridgePage.getBridgedAssetName().should('contain.text', '1 USDC')

    ScannerFacade.erc20TokenBalance(
      AddressesEnum.USDC_TOKEN_ARINKEBY,
      AddressesEnum.WALLET_PUBLIC,
      SCANNERS.ARBISCAN
    ).should((res: { body: { result: string } }) => {
      expect(parseInt(res.body.result)).to.be.at.least(Number(balanceBefore) + Number(1000000))
    })
  })
})
