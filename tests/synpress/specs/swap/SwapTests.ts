import { MenuBar } from '../../../pages/MenuBar'
import { SwapPage } from '../../../pages/SwapPage'
import { AddressesEnum } from '../../../utils/AddressesEnum'
import { EtherscanFacade } from '../../../utils/EtherscanFacade'
import { TransactionHelper } from '../../../utils/TransactionHelper'
import { TokenMenu } from '../../../pages/TokenMenu'

describe('SWAP functional tests', () => {
  const TRANSACTION_VALUE: number = 0.0001
  let estimatedTransactionOutput: number
  let ethBalanceBefore: number
  let ercBalanceBefore: number

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    SwapPage.visitSwapPage()
    MenuBar.connectWallet()
  })
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps()
  })
  it('Should swap eth to dxd [TC-51]', () => {
    EtherscanFacade.erc20TokenBalance(AddressesEnum.DXD_TOKEN_RINKEBY).then(
      (response: { body: { result: string } }) => {
        ercBalanceBefore = parseInt(response.body.result)
        console.log('BALANCE BEFORE TEST: ', ercBalanceBefore)
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
    cy.confirmMetamaskTransaction({ gasFee: 10, gasLimit: 200000 })

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap')

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
  it('Should swap dxd to weth [TC-52]', () => {
    EtherscanFacade.erc20TokenBalance(AddressesEnum.WETH_TOKEN).then((response: { body: { result: string } }) => {
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
      .then((res: any) => {
        estimatedTransactionOutput = parseFloat(res.val())
      })

    SwapPage.swap().confirmSwap()
    cy.confirmMetamaskTransaction({ gasFee: 10, gasLimit: 200000 })

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap')

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
  it('Should swap XEENUS to eth [TC-53]', () => {
    EtherscanFacade.erc20TokenBalance(AddressesEnum.XEENUS_TOKEN_RINKEBY).then(res => {
      ercBalanceBefore = parseInt(res.body.result)
      console.log('ERC BALANCE BEFORE TEST: ', ercBalanceBefore)
    })
    EtherscanFacade.ethBalance().then((response: { body: { result: string } }) => {
      ethBalanceBefore = parseInt(response.body.result)
      console.log('ETH BALANCE BEFORE TEST: ', ethBalanceBefore)
    })

    SwapPage.openTokenToSwapMenu()
      .chooseToken('xeenus')
      .switchTokens()
    SwapPage.getCurrencySelectors()
      .last()
      .click()
    TokenMenu.chooseToken('eth')
    SwapPage.typeValueFrom(TRANSACTION_VALUE.toFixed(9).toString())

    SwapPage.swap()
      .getEstimatedMinimalTransactionValue()
      .then(value => {
        estimatedTransactionOutput = parseFloat(
          value
            .text()!
            .toString()
            .replace(/[^\d.-]/g, '')
        )
      })
    SwapPage.confirmSwap()
    cy.confirmMetamaskTransaction({ gasFee: 10, gasLimit: 200000})

    TransactionHelper.checkIfTxFromLocalStorageHaveNoError()

    MenuBar.checkToastMessage('Swap')

    cy.wrap(null).then(() => {
      console.log('ESTIMATED VALUE: ', estimatedTransactionOutput * Math.pow(10, 18))
      console.log('ESTIMATED BALANCE: ', ethBalanceBefore - 0.002 + estimatedTransactionOutput * Math.pow(10, 18))
      TransactionHelper.checkEthereumBalanceFromEtherscan(
        ethBalanceBefore + estimatedTransactionOutput * Math.pow(10, 18),
        0.001000
      )
      TransactionHelper.checkErc20TokenBalance(
        AddressesEnum.XEENUS_TOKEN_RINKEBY,
        ercBalanceBefore,
        -TRANSACTION_VALUE,
        true
      )
      TransactionHelper.checkSubgraphTransaction('XEENUS', 'WETH', estimatedTransactionOutput, TRANSACTION_VALUE)
    })
  })
})
