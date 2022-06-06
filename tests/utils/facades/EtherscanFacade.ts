import { AddressesEnum } from '../enums/AddressesEnum'

export class EtherscanFacade {
  static ethBalance(walletAddress = AddressesEnum.WALLET_PUBLIC, scanner = ETHERSCAN) {
    return cy.request({
      method: 'GET',
      url: scanner.URL,
      qs: {
        module: 'account',
        action: 'balance',
        failOnStatusCode: false,
        address: walletAddress,
        tag: 'latest',
        apikey: scanner.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static erc20TokenBalance(tokenAddress: string, walletAddress = AddressesEnum.WALLET_PUBLIC, scanner = ETHERSCAN) {
    return cy.request({
      method: 'GET',
      url: scanner.URL,
      qs: {
        module: 'account',
        action: 'tokenbalance',
        failOnStatusCode: false,
        contractaddress: tokenAddress,
        address: walletAddress,
        tag: 'latest',
        apikey: scanner.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static transactionStatus(txhash: string, scanner = ETHERSCAN) {
    return cy.request({
      method: 'GET',
      url: scanner.URL,
      failOnStatusCode: false,
      qs: {
        module: 'transaction',
        action: 'getstatus',
        txhash: txhash,
        apikey: scanner.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static transaction(txhash: string, scanner = ETHERSCAN) {
    return cy.request({
      method: 'GET',
      failOnStatusCode: false,
      url: scanner.URL,
      qs: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txhash,
        apikey: scanner.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
  static balance(scanner = ETHERSCAN) {
    return cy.request({
      method: 'GET',
      url: scanner.URL,
      failOnStatusCode: false,
      qs: {
        module: 'account',
        action: 'balance',
        address: AddressesEnum.WALLET_PUBLIC,
        tag: 'latest',
        apikey: scanner.API_KEY,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  }
}

interface EtherscanService {
  URL: string
  API_KEY: string
}
export const ETHERSCAN: EtherscanService = {
  URL: 'https://api-rinkeby.etherscan.io/api?',
  API_KEY: 'RFPAWDXJ663UURXEU6QZJ9P435TY96UQIQ',
}
export const ARBISCAN: EtherscanService = {
  URL: 'https://api-testnet.arbiscan.io/api?',
  API_KEY: 'KHBZR4P9RSQXXCMZXRXHCA9AQPQY5MUDS7',
}
