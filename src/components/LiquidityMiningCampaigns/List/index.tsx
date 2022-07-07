import { LiquidityMiningCampaign, SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Text } from 'rebass'

import { useNativeCurrencyUSDPrice } from '../../../hooks/useNativeCurrencyUSDPrice'
import { usePage } from '../../../hooks/usePage'
import { useWindowSize } from '../../../hooks/useWindowSize'
import { MEDIA_WIDTHS } from '../../../theme'
import { getStakedAmountUSD } from '../../../utils/liquidityMining'
import { Pagination } from '../../Pagination'
import { Empty } from '../../Pool/Empty'
import { LoadingGrid } from '../../Pool/LoadingGrid'
import { CampaignCard } from '../../Pool/PairsList/CampaignCard'
import { UndecoratedLink } from '../../UndercoratedLink'

interface LiquidityMiningCampaignsListProps {
  items?: {
    campaign: LiquidityMiningCampaign | SingleSidedLiquidityMiningCampaign
    staked: boolean
    containsKpiToken: boolean
  }[]
  loading?: boolean
  loadingItems?: number
}

const { upToMedium, upToExtraSmall } = MEDIA_WIDTHS

export default function List({ loading, items = [], loadingItems }: LiquidityMiningCampaignsListProps) {
  const { width } = useWindowSize()
  const [page, setPage] = useState(1)
  const prevItemsCt = useRef(items.length)
  const [responsiveItemsPerPage, setResponsiveItemsPerPage] = useState(9)
  const itemsPage = usePage(items, responsiveItemsPerPage, page, 0)
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()

  useEffect(() => {
    if (!width) return

    let itemsPerPage = 9

    if (width <= upToExtraSmall) {
      itemsPerPage = 1
    } else if (width <= upToMedium) {
      itemsPerPage = 6
    }

    setResponsiveItemsPerPage(itemsPerPage)
  }, [width])

  useEffect(() => {
    if (items.length !== prevItemsCt.current) {
      setPage(1)
    }
  }, [items.length])

  const overallLoading = loading || loadingNativeCurrencyUsdPrice || !items

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-2">
          {overallLoading ? (
            <LoadingGrid itemsAmount={loadingItems || responsiveItemsPerPage} />
          ) : itemsPage.length > 0 ? (
            <div className="grid grid-cols-auto md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-5 py-3 px-4 md:p-0">
              {itemsPage.map(item => {
                if (item.campaign instanceof SingleSidedLiquidityMiningCampaign) {
                  return (
                    <UndecoratedLink
                      key={item.campaign.address}
                      to={`/rewards/single-sided-campaign/${item.campaign.stakeToken.address}/${item.campaign.address}`}
                    >
                      <CampaignCard
                        token0={item.campaign.stakeToken}
                        usdLiquidity={getStakedAmountUSD(
                          item.campaign.staked.nativeCurrencyAmount,
                          nativeCurrencyUSDPrice
                        )}
                        apy={item.campaign.apy}
                        isSingleSidedStakingCampaign={true}
                        usdLiquidityText={item.campaign.locked ? 'LOCKED' : 'STAKED'}
                        staked={item.staked}
                        campaign={item.campaign}
                      />
                    </UndecoratedLink>
                  )
                } else {
                  const token0 = item.campaign?.targetedPair.token0
                  const token1 = item.campaign?.targetedPair.token1

                  return (
                    <UndecoratedLink
                      key={item.campaign.address}
                      to={`/rewards/campaign/${token0?.address}/${token1?.address}/${item.campaign.address}`}
                    >
                      <CampaignCard
                        token0={token0}
                        token1={token1}
                        usdLiquidity={getStakedAmountUSD(
                          item.campaign.staked.nativeCurrencyAmount,
                          nativeCurrencyUSDPrice
                        )}
                        apy={item.campaign.apy}
                        containsKpiToken={item.containsKpiToken}
                        usdLiquidityText={item.campaign.locked ? 'LOCKED' : 'STAKED'}
                        staked={item.staked}
                        campaign={item.campaign}
                      />
                    </UndecoratedLink>
                  )
                }
              })}
            </div>
          ) : (
            <Empty>
              <Text fontSize="12px" fontWeight="700" lineHeight="15px" letterSpacing="0.08em">
                NO REWARD POOLS HERE YET
              </Text>
            </Empty>
          )}
        </div>
        <Box alignSelf="flex-end" mt="16px">
          {!overallLoading && itemsPage.length > 0 && (
            <Pagination
              page={page}
              totalItems={items?.length ?? 0}
              itemsPerPage={responsiveItemsPerPage}
              onPageChange={setPage}
            />
          )}
        </Box>
      </div>
    </>
  )
}
