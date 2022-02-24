export type Quote = {
  success: boolean
  result: {
    fromAsset: {
      address: string
      chainId: number
      decimals: number
      icon: string
      name: string
      symbol: string
    }
    toAsset: {
      chainId: number
      address: string
      decimals: number
      icon: string
      name: string
      symbol: string
    }
    toChainId: number
    fromChainId: number
    routes: [
      {
        chainGasBalances: {
          [n in number]: {
            hasGasBalance: false
            minGasBalance: string
          }
        }
        fromAmount: string
        routeId: string
        sender: string
        serviceTime: number
        toAmount: string
        totalGasFeesInUsd: number
        totalUserTx: number
        usedBridgeNames: string[]
        userTxs: any //TODO type it
      }
    ]
  }
}
