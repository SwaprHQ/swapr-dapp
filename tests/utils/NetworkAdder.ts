export class NetworkAdder {
  static addGnosis() {
    cy.addMetamaskNetwork({
      networkName: 'gnosis chain',
      rpcUrl: 'https://rpc.gnosischain.com/',
      chainId: '100',
      symbol: 'xDai',
      blockExplorer: 'https://blockscout.com/xdai/mainnet',
      isTestnet: true,
    })
  }
  static adARinkeby() {
    cy.addMetamaskNetwork({
      networkName: 'arbitrum rinkeby',
      rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
      chainId: '421611',
      symbol: 'ETH',
      blockExplorer: 'https://rinkeby-explorer.arbitrum.io/#/',
      isTestnet: true,
    })
  }
}
