import { ChainId, Currency } from '@swapr/sdk'

import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'

export function useNativeCurrency(chainId?: ChainId): Currency {
  const { chainId: activeChainId } = useWeb3ReactCore()
  const selectedChainId = chainId ?? activeChainId
  // fallback to ether if chain id is not defined
  if (!selectedChainId) return Currency.ETHER
  return Currency.getNative(selectedChainId) || Currency.ETHER
}
