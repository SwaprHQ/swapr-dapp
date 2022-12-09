import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { useArgentWalletDetectorContract } from './useContract'
import { useWeb3ReactCore } from './useWeb3ReactCore'

export default function useIsArgentWallet(): boolean {
  const { account } = useWeb3ReactCore()
  const argentWalletDetector = useArgentWalletDetectorContract()
  const call = useSingleCallResult(argentWalletDetector, 'isArgentWallet', [account ?? undefined], NEVER_RELOAD)
  return call?.result?.[0] ?? false
}
