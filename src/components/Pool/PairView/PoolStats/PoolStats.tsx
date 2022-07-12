import { Pair } from '@swapr/sdk'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrevious } from 'react-use'

import { useActiveWeb3React } from '../../../../hooks'
import { useBestAPY } from '../../../../hooks/useBestAPY'
import { usePairCampaignIndicatorAndLiquidityUSD } from '../../../../hooks/usePairCampaignIndicatorAndLiquidityUSD'
import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { useRouter } from '../../../../hooks/useRouter'
import { useIsSwitchingToCorrectChain } from '../../../../state/multi-chain-links/hooks'
import { formatCurrencyAmount } from '../../../../utils'
import { ButtonExternalLink } from '../../../Button'
import { DimBlurBgBox } from '../../DimBlurBgBox/styleds'
import { InfoGrid } from '../InfoGrid/InfoGrid.styles'
import { ValueWithLabel } from '../ValueWithLabel'

interface PairViewProps {
  loading: boolean
  pair?: Pair | null
}

export function PoolStats({ pair }: PairViewProps) {
  const { navigate } = useRouter()
  const { chainId } = useActiveWeb3React()
  const previousChainId = usePrevious(chainId)
  const { volume24hUSD } = usePair24hVolumeUSD(pair?.liquidityToken.address)
  const { liquidityUSD } = usePairCampaignIndicatorAndLiquidityUSD(pair)
  const { bestAPY } = useBestAPY(pair)
  const switchingToCorrectChain = useIsSwitchingToCorrectChain()
  const { t } = useTranslation()

  const statsLink = pair?.liquidityToken.address
    ? `https://dxstats.eth.limo/#/pair/${pair?.liquidityToken.address}?chainId=${chainId}`
    : `https://dxstats.eth.limo/#/pairs?chainId=${chainId}`

  useEffect(() => {
    // when the chain is switched, and not as a reaction to following a multi chain link
    // (which might require changing chains), redirect to generic pools page
    if (chainId && previousChainId && chainId !== previousChainId && !switchingToCorrectChain) {
      navigate('/pools')
    }
  }, [chainId, navigate, previousChainId, switchingToCorrectChain])

  return (
    <DimBlurBgBox padding>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="md:text-lg mb-5">{t('poolStats')}</p>
        <div>
          <ButtonExternalLink link={statsLink}>{t('stats')}</ButtonExternalLink>
        </div>
      </div>
      <div className="mt-5">
        <InfoGrid>
          <ValueWithLabel title={t('TVL')} value={`$${formatCurrencyAmount(liquidityUSD)}`} />
          <ValueWithLabel title={t('24hVolume')} value={`$${formatCurrencyAmount(volume24hUSD)}`} />
          <ValueWithLabel title={t('APY')} value={`${bestAPY?.toFixed(2) || 0}%`} big />
        </InfoGrid>
      </div>
    </DimBlurBgBox>
  )
}
