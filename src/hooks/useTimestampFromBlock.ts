import { useEffect, useState } from 'react'

import { useActiveWeb3React } from './index'

export function useTimestampFromBlock(block: number | undefined): number | undefined {
  const { provider } = useActiveWeb3React()
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
