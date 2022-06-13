import { MenuBar } from '../../../../pages/MenuBar'
import { SwapPage } from '../../../../pages/SwapPage'
import { AddressesEnum } from '../../../../utils/enums/AddressesEnum'
import { ScannerFacade } from '../../../../utils/facades/ScannerFacade'
import { TransactionHelper } from '../../../../utils/TransactionHelper'

describe('Wrapping tests', () => {
  const TRANSACTION_VALUE: number = 0.001

  let balanceBefore: number

  before(() => {
    cy.changeMetamaskNetwork('rinkeby')
  })

  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()

    ScannerFacade.erc20TokenBalance(AddressesEnum.WETH_TOKEN).then(response => {
      balanceBefore = parseInt(response.body.result)
    })
  })
  after(() => {
    cy.resetMetamaskAccount()
    cy.disconnectMetamaskWalletFromAllDapps()
    cy.wait(500)
  })

  it('Should wrap ETH to WETH [TC-03]', () => {
    SwapPage.openTokenToSwapMenu()
      .chooseToken('weth')
      .typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())
      .wrap()
    cy.confirmMetamaskTransaction({})

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Wrap')

    TransactionHelper.checkErc20TokenBalance(AddressesEnum.WETH_TOKEN, balanceBefore, TRANSACTION_VALUE, true)
  })

  it('Should unwrap WETH to ETH [TC-06]', () => {
    SwapPage.openTokenToSwapMenu()
      .chooseToken('eth')
      .openTokenToSwapMenu()
      .chooseToken('weth')
      .typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())
      .unwrap()
    cy.confirmMetamaskTransaction({})

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Unwrap')

    TransactionHelper.checkErc20TokenBalance(AddressesEnum.WETH_TOKEN, balanceBefore, -TRANSACTION_VALUE, true)
  })
})
