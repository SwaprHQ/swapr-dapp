import { ChainId } from '@swapr/sdk'

import { memo } from 'react'

import { useActiveWeb3React } from '../../../../../hooks'
import { DexScreenerIframe, Wrapper } from './Chart.styles'
import { ChartLoader } from './ChartLoader.component'

const dexScreenChains: Record<number, string> = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.BSC_MAINNET]: 'bsc',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.OPTIMISM_MAINNET]: 'optimism',
  [ChainId.GNOSIS]: 'gnosischain',
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
