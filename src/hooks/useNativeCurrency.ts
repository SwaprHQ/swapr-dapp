import { ChainId, Currency } from '@swapr/sdk'

import { useWeb3React } from '@web3-react/core'

export function useNativeCurrency(chainId?: ChainId): Currency {
  const { chainId: activeChainId } = useWeb3React()
  const selectedChainId = chainId ?? activeChainId
  // fallback to ether if chain id is not defined
  if (!selectedChainId) return Currency.ETHER
  return Currency.getNative(selectedChainId) || Currency.ETHER
}
