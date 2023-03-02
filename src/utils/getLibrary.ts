import { Web3Provider } from '@ethersproject/providers'

import { REFETCH_DATA_INTERVAL } from './alchemy'

export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = REFETCH_DATA_INTERVAL
  return library
}
