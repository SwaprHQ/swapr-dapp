import { SwapPage } from '../../../pages/SwapPage'
import { TokenMenu } from '../../../pages/TokenMenu'
import { AddressesEnum } from '../../../utils/enums/AddressesEnum'
import { TransactionHelper } from '../../../utils/TransactionHelper'

describe('Token menu smoke tests', () => {
  const TYPING_DELAY = 110
  beforeEach(() => {
    SwapPage.visitSwapPage()
    TransactionHelper.waitForTokenLists()
    SwapPage.openTokenToSwapMenu()
  })
  it('Should display token picker which contains token input,manage token lists button, common tokens and token list [TC-39]', () => {
    TokenMenu.getPicker().should('be.visible')
    TokenMenu.getCommonTokens().should('be.visible')
    TokenMenu.getSingleTokenManagerInput().should('be.visible')
    TokenMenu.getOpenTokenManagerButton().should('be.visible')
  })
  it('Should open token list manager and should display list as default [TC-40]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.getTokenListManager().should('be.visible')
    TokenMenu.getSwitchTokenManagerToTokens().should('be.visible')
    TokenMenu.getSwitchTokenManagerToLists().should('be.visible')
    TokenMenu.getTokenListManagerInput().should('be.visible')
    TokenMenu.getTokenListManagerTitle().should('contain.text', 'list')
  })
  it('Should switch between token lists manage and tokens manage [TC-41]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.switchTokenManagerToTokens()
    TokenMenu.getTokenListManagerTitle().should('contain.text', 'token')
    TokenMenu.switchTokenManagerToLists()
    TokenMenu.getTokenListManagerTitle().should('contain.text', 'list')
  })
  it('Should add additional token [TC-42]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.getSingleTokenManagerInput()
      .type(AddressesEnum.STRONG_TOKEN_RINKEBY, { delay: TYPING_DELAY })
      .should('have.value', AddressesEnum.STRONG_TOKEN_RINKEBY)
    TokenMenu.getTokenManagerRow('strong').should('be.visible')
    TokenMenu.importToken('strong')
    TokenMenu.getTokenImportWarning().should('be.visible')
    TokenMenu.confirmTokenImport()
    SwapPage.getCurrencySelectors()
      .last()
      .should('contain.text', 'STRONG')
  })
  it('Should display warning when single token address is invalid [TC-43]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.getSingleTokenManagerInput().type('Definitely Not Token Address')
    TokenMenu.getTokenManagerErrorMessage()
      .should('be.visible')
      .should('contain.text', 'Enter valid token address')
  })
  it('Should display warning when token list address is invalid [TC-44]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.getTokenListManagerInput().type('Definitely Not list Address')
    TokenMenu.getTokenManagerErrorMessage()
      .should('be.visible')
      .should('contain.text', 'Enter valid list location')
  })
  it('Should find token by valid address [TC-45]', () => {
    TokenMenu.getSingleTokenManagerInput()
      .type(AddressesEnum.DXD_TOKEN_MAINNET, { delay: TYPING_DELAY })
      .should('have.value', AddressesEnum.DXD_TOKEN_MAINNET)
    TokenMenu.getTokenRow('dxd').should('be.visible')
  })
  it('Should find token by name [TC-46]', () => {
    TokenMenu.getSingleTokenManagerInput().type('dxd')
    TokenMenu.getTokenRow('dxd').should('be.visible')
  })
  it('Should disable all token lists [TC-47]', () => {
    TokenMenu.openTokenManager()
    TokenMenu.switchTokenList('swapr-token-list')
    TokenMenu.getTokenListsRow('swapr-token-list').should('contain.text', 'OFF')
    TokenMenu.goBack()
      .getPicker()
      .should('contain.text', 'No results found')
  })
})
