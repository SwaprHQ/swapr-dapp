import { useWeb3React } from '@web3-react/core'

import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { useArgentWalletDetectorContract } from './useContract'

export default function useIsArgentWallet(): boolean {
  const { account } = useWeb3React()
  const argentWalletDetector = useArgentWalletDetectorContract()
  const call = useSingleCallResult(argentWalletDetector, 'isArgentWallet', [account ?? undefined], NEVER_RELOAD)
  return call?.result?.[0] ?? false
}
