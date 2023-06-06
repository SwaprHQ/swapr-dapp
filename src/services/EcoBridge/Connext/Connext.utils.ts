import { Logger } from '@connext/nxtp-utils'

import { Assets } from './Connext.lists'

/**
 * Used to suppress logs from connext sdk
 */
export class SilentLogger extends Logger {
  constructor(...args: any[]) {
    //@ts-expect-error
    super(args)
    this['print'] = () => {
      return
    }

    this.child = (...any: any[]) => {
      return new SilentLogger(...any)
    }
  }
}

export const getConnextContract = (chainId: number, symbol?: string) => {
  if (symbol) {
    const asset = Assets.find(a => a.symbol.toLowerCase() === symbol.toLowerCase())
    if (asset) {
      const contract = asset.contracts.find(c => c.chain_id.toString() === chainId.toString())
      if (contract) {
        return contract.contract_address
      }
    }
  }
}
