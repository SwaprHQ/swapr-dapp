import { ChainId } from '@swapr/sdk'

import { memo } from 'react'

import { useActiveWeb3React } from '../../../../../hooks'

import { DexScreenerIframe, Wrapper } from './Chart.styles'
import { ChartLoader } from './ChartLoader.component'

const dexScreenChains: Record<number, string> = {
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.BSC_MAINNET]: 'bsc',
  [ChainId.GNOSIS]: 'gnosischain',
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.OPTIMISM_MAINNET]: 'optimism',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.SCROLL_MAINNET]: 'scroll',
  [ChainId.ZK_SYNC_ERA_MAINNET]: 'zksync',
}

export const Chart = memo(({ pairAddress }: { pairAddress?: string }) => {
  const { chainId } = useActiveWeb3React()

  const network = chainId && dexScreenChains[chainId]

  const iframeSource = `https://dexscreener.com/${network}/${pairAddress}?embed=1&theme=dark&trades=0&info=0`

  return (
    <Wrapper>
      {network && (
        <DexScreenerIframe>
          <iframe title="chartFrame" src={iframeSource} />
        </DexScreenerIframe>
      )}
      <ChartLoader pairAddress={pairAddress} />
    </Wrapper>
  )
})
