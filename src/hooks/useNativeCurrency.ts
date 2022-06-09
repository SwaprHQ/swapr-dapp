import { ChainId, Currency } from '@swapr/sdk'
import { useActiveWeb3React } from '.'

export function useNativeCurrency(chainId?: ChainId): Currency {
  const { chainId: activeChainId } = useActiveWeb3React()
  const selectedChainId = chainId ?? activeChainId
  // fallback to ether if chain id is not defined
  if (!selectedChainId) return Currency.ETHER
  return Currency.getNative(selectedChainId) || Currency.ETHER
}
