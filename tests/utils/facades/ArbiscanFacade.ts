import { AddressesEnum } from '../enums/AddressesEnum'

export class ArbiscanFacade {
  private static ARBISCAN_URL = 'https://api-testnet.arbiscan.io/api?'
  private static API_KEY = 'KHBZR4P9RSQXXCMZXRXHCA9AQPQY5MUDS7'

  static ethBalance(walletAddress = AddressesEnum.WALLET_PUBLIC) {
    return cy.request({
      method: 'GET',
      url: this.ARBISCAN_URL,
      qs: {
        module: 'account',
        action: 'balance',
        failOnStatusCode: false,
        address: walletAddress,
        tag: 'latest',
        apikey: this.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static erc20TokenBalance(tokenAddress: string, walletAddress = AddressesEnum.WALLET_PUBLIC) {
    return cy.request({
      method: 'GET',
      url: this.ARBISCAN_URL,
      qs: {
        module: 'account',
        action: 'tokenbalance',
        failOnStatusCode: false,
        contractaddress: tokenAddress,
        address: walletAddress,
        tag: 'latest',
        apikey: this.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static transactionStatus(txhash: string) {
    return cy.request({
      method: 'GET',
      url: this.ARBISCAN_URL,
      failOnStatusCode: false,
      qs: {
        module: 'transaction',
        action: 'getstatus',
        txhash: txhash,
        apikey: this.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static transaction(txhash: string) {
    return cy.request({
      method: 'GET',
      failOnStatusCode: false,
      url: this.ARBISCAN_URL,
      qs: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txhash,
        apikey: this.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static balance() {
    return cy.request({
      method: 'GET',
      url: this.ARBISCAN_URL,
      failOnStatusCode: false,
      qs: {
        module: 'account',
        action: 'balance',
        address: AddressesEnum.WALLET_PUBLIC,
        tag: 'latest',
        apikey: this.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
}
