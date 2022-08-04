import { useEffect, useState } from 'react'

import { useWeb3ReactCore } from './useWeb3ReactCore'

export function useTimestampFromBlock(block: number | undefined): number | undefined {
  const { provider } = useWeb3ReactCore()
  const [timestamp, setTimestamp] = useState<number>()
  useEffect(() => {
    async function fetchTimestamp() {
      if (block) {
        const blockData = await provider?.getBlock(block)
        blockData && setTimestamp(blockData.timestamp)
      }
    }
    if (!timestamp) {
      fetchTimestamp()
    }
  }, [block, provider, timestamp])
  return timestamp
}
