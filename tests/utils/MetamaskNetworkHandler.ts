import { Network } from './TestTypes'

export class MetamaskNetworkHandler {
  static addGnosis() {
    cy.addMetamaskNetwork({
      networkName: 'gnosis chain',
      rpcUrl: 'https://rpc.gnosischain.com/',
      chainId: '100',
      symbol: 'xDai',
      blockExplorer: 'https://gnosisscan.io',
      isTestnet: true,
    })
  }
  static addARinkeby() {
    cy.addMetamaskNetwork({
      networkName: 'arbitrum rinkeby',
      rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
      chainId: '421611',
      symbol: 'ETH',
      blockExplorer: 'https://rinkeby-explorer.arbitrum.io/#/',
      isTestnet: true,
    })
  }
  static addArbitrumOne() {
    cy.addMetamaskNetwork({
      networkName: 'arbitrum one',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      chainId: '42161',
      symbol: 'ETH',
      blockExplorer: 'https://arbiscan.io/',
      isTestnet: true,
    })
  }
  static switchToNetworkIfNotConnected(desiredNetwork: string = 'rinkeby') {
    cy.changeMetamaskNetwork(desiredNetwork)
  }
}
