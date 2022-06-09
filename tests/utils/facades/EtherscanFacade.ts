import { AddressesEnum } from '../enums/AddressesEnum'

export class EtherscanFacade {
  private static ETHERSCAN_URL = 'https://api-rinkeby.etherscan.io/api?'

  static ethBalance(walletAddress = AddressesEnum.WALLET_PUBLIC) {
    return cy.request({
      method: 'GET',
      url: this.ETHERSCAN_URL,
      qs: {
        module: 'account',
        action: 'balance',
        failOnStatusCode: false,
        address: walletAddress,
        tag: 'latest',
        apikey: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
  static erc20TokenBalance(tokenAddress: string, walletAddress = AddressesEnum.WALLET_PUBLIC) {
    return cy.request({
      method: 'GET',
      url: this.ETHERSCAN_URL,
      qs: {
        module: 'account',
        action: 'tokenbalance',
        failOnStatusCode: false,
        contractaddress: tokenAddress,
        address: walletAddress,
        tag: 'latest',
        apikey: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
  static transactionStatus(txhash: string) {
    return cy.request({
      method: 'GET',
      url: this.ETHERSCAN_URL,
      failOnStatusCode: false,
      qs: {
        module: 'transaction',
        action: 'getstatus',
        txhash: txhash,
        apikey: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
  static transaction(txhash: string) {
    return cy.request({
      method: 'GET',
      failOnStatusCode: false,
      url: this.ETHERSCAN_URL,
      qs: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txhash,
        apikey: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
  static balance() {
    return cy.request({
      method: 'GET',
      url: this.ETHERSCAN_URL,
      failOnStatusCode: false,
      qs: {
        module: 'account',
        action: 'balance',
        address: AddressesEnum.WALLET_PUBLIC,
        tag: 'latest',
        apikey: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
