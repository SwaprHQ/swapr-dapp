import { BigNumber } from 'ethers'

import { useMulticallContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useMulticallContract()
  return useSingleCallResult(multicall, 'getCurrentBlockTimestamp')?.result?.[0]
}
