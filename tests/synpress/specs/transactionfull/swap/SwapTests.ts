import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { AddressesEnum } from '../../../../utils/enums/AddressesEnum'
import { ScannerFacade } from '../../../../utils/facades/ScannerFacade'
import { TransactionHelper } from '../../../../utils/TransactionHelper'
import { TokenMenu } from '../../../../pages/TokenMenu'

describe('Swapping tests', () => {
  const TRANSACTION_VALUE: number = 0.0001
  let estimatedTransactionOutput: number
  let ethBalanceBefore: number
  let ercBalanceBefore: number

  before(() => {
    cy.changeMetamaskNetwork('rinkeby')
  })
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
  })
  after(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    MenuBar.getConnectWalletButton().should('be.visible')
    cy.resetMetamaskAccount()
  })
  it('Should swap eth to dxd [TC-51]', () => {
    ScannerFacade.erc20TokenBalance(AddressesEnum.DXD_TOKEN_RINKEBY).then((response: { body: { result: string } }) => {
      ercBalanceBefore = parseInt(response.body.result)
      console.log('BALANCE BEFORE TEST: ', ercBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu()
      .chooseToken('dxd')
      .typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.getToInput()
      .should('not.have.value', '')
      .then((res: JQuery) => {
        estimatedTransactionOutput = parseFloat(res.val() as string)
      })

    SwapPage.swap().confirmSwap()
    cy.confirmMetamaskTransaction({})

    SwapPage.getTransactionConfirmedModal()
      .should('be.visible')
      .should('contain.text', 'Transaction Submitted')

    MenuBar.checkToastMessage('Swap', String(TRANSACTION_VALUE), 'ETH', 'DXD')

    cy.wrap(null).then(() => {
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.DXD_TOKEN_RINKEBY,
        ercBalanceBefore,
        estimatedTransactionOutput,
        false
      )
      TransactionHelper.checkSubgraphTransaction('DXD', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })
  it('Should swap DXD to WETH [TC-52]', () => {
    ScannerFacade.erc20TokenBalance(AddressesEnum.WETH_TOKEN).then((response: { body: { result: string } }) => {
      ercBalanceBefore = parseInt(response.body.result)
      console.log('BALANCE BEFORE TEST: ', ercBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu()
      .chooseToken('dxd')
      .switchTokens()
    SwapPage.getCurrencySelectors()
      .last()
      .click()
    TokenMenu.chooseToken('weth')
    SwapPage.typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.getToInput()
      .should('not.have.value', '')
      .then((res: JQuery) => {
        estimatedTransactionOutput = parseFloat(res.val() as string)
      })

    SwapPage.swap().confirmSwap()
    cy.confirmMetamaskTransaction({})

    SwapPage.getTransactionConfirmedModal()
      .should('be.visible')
      .should('contain.text', 'Transaction Submitted')

    MenuBar.checkToastMessage('Swap', 'DXD', 'WETH', String(TRANSACTION_VALUE))

    cy.wrap(null).then(() => {
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.WETH_TOKEN,
        ercBalanceBefore,
        estimatedTransactionOutput,
        false
      )
      TransactionHelper.checkSubgraphTransaction('DXD', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })

  it('Should swap LINK to ETH [TC-53]', () => {
    ScannerFacade.erc20TokenBalance(AddressesEnum.LINK_ADDRESS_RINKEBY).then(res => {
      ercBalanceBefore = parseInt(res.body.result)
      console.log('ERC BALANCE BEFORE TEST: ', ercBalanceBefore)
    })
    ScannerFacade.ethBalance().then((response: { body: { result: string } }) => {
      ethBalanceBefore = parseInt(response.body.result)
      console.log('ETH BALANCE BEFORE TEST: ', ethBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu()
      .getOpenTokenManagerButton()
      .click()
    TokenMenu.getSwitchTokenManagerToTokens().click()
    TokenMenu.getSingleTokenManagerInput().type(AddressesEnum.LINK_ADDRESS_RINKEBY)
    TokenMenu.importToken('link')
    TokenMenu.confirmTokenImport()
    SwapPage.getCurrencySelectors()
      .last()
      .should('contain.text', 'LINK')
    SwapPage.switchTokens()
    SwapPage.typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.swap()
    SwapPage.getEstimatedMinimalTransactionValue().then(value => {
      estimatedTransactionOutput = parseFloat(
        value
          .text()!
          .toString()
          .replace(/[^\d.-]/g, '')
      )
    })
    SwapPage.confirmSwap()
    cy.confirmMetamaskTransaction({})

    SwapPage.getTransactionConfirmedModal()
      .should('be.visible')
      .should('contain.text', 'Transaction Submitted')

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap', 'LINK', 'ETH', String(TRANSACTION_VALUE))

    cy.wrap(null).then(() => {
      console.log('ESTIMATED VALUE: ', estimatedTransactionOutput * Math.pow(10, 18))
      console.log('ESTIMATED BALANCE: ', ethBalanceBefore - 0.002 + estimatedTransactionOutput * Math.pow(10, 18))
      TransactionHelper.checkEthereumBalanceFromEtherscan(
        ethBalanceBefore + estimatedTransactionOutput * Math.pow(10, 18),
        0.001
      )
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.LINK_ADDRESS_RINKEBY,
        ercBalanceBefore,
        -TRANSACTION_VALUE,
        true
      )
      TransactionHelper.checkSubgraphTransaction('LINK', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })
  it('Should send ether to ens domain address [TC-54]', () => {
    ScannerFacade.ethBalance(AddressesEnum.SECOND_TEST_WALLET).then((response: { body: { result: string } }) => {
      ethBalanceBefore = parseInt(response.body.result)
      console.log('ETH BALANCE BEFORE TEST: ', ethBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu().chooseToken('dxd')
    SwapPage.getToInput().type(TRANSACTION_VALUE.toFixed(9).toString())
    SwapPage.getAlternateReceiverButton().click()
    SwapPage.switchTokens()
    SwapPage.getAlternateReceiverInput().type('testrf2.eth', { delay: 50 })
    SwapPage.getAlternateReceiverInput().should('have.value', AddressesEnum.SECOND_TEST_WALLET)
    SwapPage.swap().confirmSwap()

    cy.confirmMetamaskTransaction({})

    SwapPage.getTransactionConfirmedModal()
      .should('be.visible')
      .should('contain.text', 'Transaction Submitted')

    MenuBar.checkToastMessage('Swap', 'DXD', 'ETH', String(TRANSACTION_VALUE))

    cy.wrap(null).then(() => {
      console.log(ethBalanceBefore, TRANSACTION_VALUE * Math.pow(10, 18))

      TransactionHelper.checkEthereumBalanceFromEtherscan(
        ethBalanceBefore + TRANSACTION_VALUE * Math.pow(10, 18),
        0,
        AddressesEnum.SECOND_TEST_WALLET
      )
    })
  })
  it('Should send erc20 token to wallet address [TC-54]', () => {
    ScannerFacade.erc20TokenBalance(AddressesEnum.XEENUS_TOKEN_RINKEBY, AddressesEnum.SECOND_TEST_WALLET).then(res => {
      ercBalanceBefore = parseInt(res.body.result)
      console.log('ERC BALANCE BEFORE TEST: ', ercBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu().chooseToken('xeenus')
    SwapPage.getToInput().type(TRANSACTION_VALUE.toFixed(9).toString())
    SwapPage.getAlternateReceiverButton().click()
    SwapPage.getAlternateReceiverInput().type(AddressesEnum.SECOND_TEST_WALLET, { delay: 50 })
    SwapPage.getAlternateReceiverInput().should('have.value', AddressesEnum.SECOND_TEST_WALLET)
    SwapPage.swap().confirmSwap()

    cy.confirmMetamaskTransaction({})

    SwapPage.getTransactionConfirmedModal()
      .should('be.visible')
      .should('contain.text', 'Transaction Submitted')

    MenuBar.checkToastMessage('Swap', 'XEENUS', 'ETH', String(TRANSACTION_VALUE))

    cy.wrap(null).then(() => {
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.XEENUS_TOKEN_RINKEBY,
        ercBalanceBefore,
        TRANSACTION_VALUE,
        true,
        AddressesEnum.SECOND_TEST_WALLET
      )
    })
  })
})
