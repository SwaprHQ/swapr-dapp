import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import { AddressesEnum } from '../../../utils/AddressesEnum'
import { EtherscanFacade } from '../../../utils/EtherscanFacade'
import { TransactionHelper } from '../../../utils/TransactionHelper'
import {TokenMenu} from "../../../pages/TokenMenu";

describe('SWAP functional tests', () => {
  const TRANSACTION_VALUE: number = 0.000001
  let estimatedTransactionOutput: number
  let balanceBefore: number

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
  })
  it('Should swap eth to dxd', () => {
    EtherscanFacade.erc20TokenBalance(AddressesEnum.DXD_TOKEN_RINKEBY).then(
      (response: { body: { result: string } }) => {
        balanceBefore = parseInt(response.body.result)
        console.log(balanceBefore)
      }
    )

    SwapPage.openTokenToSwapMenu()
      .chooseToken('dxd')
      .typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.getToInput()
      .should('not.have.value', '')
      .then((res: any) => {
        estimatedTransactionOutput = parseFloat(res.val())
      })

    SwapPage.swap().confirmSwap()
    cy.confirmMetamaskTransaction({ gasFee: 11 })

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap')

    cy.wrap(null).then(() => {
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.DXD_TOKEN_RINKEBY,
        balanceBefore,
        estimatedTransactionOutput,
        100000000
      )
      TransactionHelper.checkSubgraphTransaction('DXD', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })
  it('Should swap dxd to weth', () => {
    EtherscanFacade.erc20TokenBalance(AddressesEnum.WETH_TOKEN).then((response: { body: { result: string } }) => {
      balanceBefore = parseInt(response.body.result)
      console.log("BALANCE BEFORE TEST: ",balanceBefore)
    })

    SwapPage.openTokenToSwapMenu()
      .chooseToken('dxd')
      .switchTokens()
    SwapPage.getCurrencySelectors().last().click()
    TokenMenu.chooseToken("weth")
    SwapPage.typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.getToInput()
      .should('not.have.value', '')
      .then((res: any) => {
        console.log("ESTIMATED OUTPUT: ", res.val())
        estimatedTransactionOutput = parseFloat(res.val())
      })

    SwapPage.swap().confirmSwap()
    cy.confirmMetamaskTransaction({ gasFee: 11 })

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap')

    cy.wrap(null).then(() => {
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.WETH_TOKEN,
        balanceBefore,
        estimatedTransactionOutput,
        100000000
      )
      TransactionHelper.checkSubgraphTransaction('DXD', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })
})
