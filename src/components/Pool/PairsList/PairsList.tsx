import { SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'

import { AggregatedPairs } from 'hooks/useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useActiveWeb3React } from '../../../hooks'
import { useSWPRToken } from '../../../hooks/swpr/useSWPRToken'
import { useIsMobileByMedia } from '../../../hooks/useIsMobileByMedia'
import { useNativeCurrencyUSDPrice } from '../../../hooks/useNativeCurrencyUSDPrice'
import { usePage } from '../../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { getStakedAmountUSD } from '../../../utils/liquidityMining'
import { ButtonPrimary } from '../../Button'
import { Pagination } from '../../Pagination'
import { UndecoratedLink } from '../../UndercoratedLink'
import { DimBlurBgBox } from '../DimBlurBgBox/styleds'
import { PairsFilterType } from '../ListFilter'
import { LoadingList } from './LoadingList'
import { Pair as PairCard } from './Pair'
import { PoolListHeader } from './PoolListHeader'

interface PairsListProps {
  aggregatedPairs: AggregatedPairs[]
  singleSidedStake?: SingleSidedLiquidityMiningCampaign
  hasActiveCampaigns?: boolean
  filter?: PairsFilterType
  loading?: boolean
  hasSingleSidedStake?: boolean
}

export function PairsList({ aggregatedPairs, loading, filter, singleSidedStake }: PairsListProps) {
  const { chainId } = useActiveWeb3React()
  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const itemsPage = usePage(aggregatedPairs, responsiveItemsPerPage, page, 0)
  const SWPRToken = useSWPRToken()
  const swprAddress = SWPRToken?.address ?? undefined
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  const { t } = useTranslation()
  const isMobile = useIsMobileByMedia()

  useEffect(() => {
    // reset page when connected chain or selected filter changes
    setPage(1)
  }, [chainId, filter, aggregatedPairs])
  const isSWPRSingleSidedStake =
    swprAddress && singleSidedStake?.stakeToken.address.toLowerCase() === swprAddress.toLowerCase()

  return (
    <div className="flex flex-col">
      <DimBlurBgBox>
        {loading ? (
          <LoadingList />
        ) : itemsPage.length > 0 || singleSidedStake ? (
          <div className="grid grid-cols-auto py-3 px-4 md:p-0">
            {!isMobile && <PoolListHeader />}
            {singleSidedStake && !loadingNativeCurrencyUsdPrice && page === 1 && (
              <UndecoratedLink
                className="border-b border-solid border-bg3"
                key={singleSidedStake.address}
                to={
                  isSWPRSingleSidedStake
                    ? '/rewards'
                    : `/pools/${singleSidedStake.stakeToken.address}/${singleSidedStake.address}/singleSidedStaking`
                }
              >
                <PairCard
                  token0={singleSidedStake.stakeToken}
                  pairOrStakeAddress={singleSidedStake.stakeToken.address}
                  usdLiquidity={getStakedAmountUSD(
                    singleSidedStake.staked.nativeCurrencyAmount,
                    nativeCurrencyUSDPrice
                  )}
                  apy={singleSidedStake.apy}
                  hasFarming={true}
                  isSingleSidedStakingCampaign={true}
                />
              </UndecoratedLink>
            )}
            {itemsPage.length > 0 &&
              itemsPage.map(aggregatedPair => {
                return (
                  <UndecoratedLink
                    className="border-b border-solid border-bg3 last:border-none"
                    key={aggregatedPair.pair.liquidityToken.address}
                    to={`/pools/${aggregatedPair.pair.token0.address}/${aggregatedPair.pair.token1.address}`}
                  >
                    <PairCard
                      token0={aggregatedPair.pair.token0}
                      token1={aggregatedPair.pair.token1}
                      pairOrStakeAddress={aggregatedPair.pair.liquidityToken.address}
                      usdLiquidity={aggregatedPair.liquidityUSD}
                      apy={aggregatedPair.maximumApy}
                      containsKpiToken={aggregatedPair.containsKpiToken}
                      hasFarming={aggregatedPair.hasFarming}
                    />
                  </UndecoratedLink>
                )
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-col my-24">
            <p className="mb-6 text-text4">{t('noPoolsFound')}</p>
            <div className="w-fit">
              <ButtonPrimary to="/pools/create" as={Link}>
                {t('createAPool')}
              </ButtonPrimary>
            </div>
          </div>
        )}
      </DimBlurBgBox>
      {aggregatedPairs.length > responsiveItemsPerPage && (
        <div className="flex justify-center md:justify-end md:w-full my-4">
          <Pagination
            page={page}
            totalItems={aggregatedPairs.length + 1}
            itemsPerPage={responsiveItemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
