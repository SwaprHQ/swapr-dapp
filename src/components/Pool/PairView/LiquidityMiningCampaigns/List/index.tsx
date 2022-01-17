import { LiquidityMiningCampaign, SingleSidedLiquidityMiningCampaign, Pair } from '@swapr/sdk'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Pagination from '../../../../Pagination'
import Empty from '../../../Empty'
import LoadingList from '../../../LoadingList'
import { usePage } from '../../../../../hooks/usePage'
import { useWindowSize } from '../../../../../hooks/useWindowSize'
import { MEDIA_WIDTHS } from '../../../../../theme'
//import PairCard from '../../../PairsList/Pair'
import { useNativeCurrencyUSDPrice } from '../../../../../hooks/useNativeCurrencyUSDPrice'
import { getStakedAmountUSD } from '../../../../../utils/liquidityMining'
import { UndecoratedLink } from '../../../../UndercoratedLink'
import CampaignCard from '../../../PairsList/CampaignCard'

const ListLayout = styled.div`
  display: grid;
  grid-gap: 12px 10px;
  grid-template-columns: 1fr 1fr 1fr;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr 1fr;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: auto;
    grid-gap: 8px;
  `};
`

interface LiquidityMiningCampaignsListProps {
  stakablePair?: Pair
  items?: { campaign: LiquidityMiningCampaign; staked: boolean; containsKpiToken: boolean }[]
  loading?: boolean
  singleSidedCampaings?: { campaign: SingleSidedLiquidityMiningCampaign; staked: boolean; containsKpiToken: boolean }[]
}

const { upToSmall, upToMedium, upToExtraSmall } = MEDIA_WIDTHS

export default function List({
  stakablePair,
  loading,
  items = [],
  singleSidedCampaings = []
}: LiquidityMiningCampaignsListProps) {
  const [page, setPage] = useState(1)
  const [responsiveItemsPerPage, setResponsiveItemsPerPage] = useState(3)
  const combinedCampaings = [...singleSidedCampaings, ...items]
  console.log(responsiveItemsPerPage)
  const itemsPage = usePage(combinedCampaings, responsiveItemsPerPage, page, 0)
  const { width } = useWindowSize()
  console.log(width)
  console.log(upToMedium)
  console.log(upToSmall)
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()

  useEffect(() => {
    if (!width) return
    else if (width <= upToExtraSmall) setResponsiveItemsPerPage(1)
    else if (width <= upToMedium) setResponsiveItemsPerPage(2)
    else setResponsiveItemsPerPage(3)
  }, [width])

  const overallLoading = loading || loadingNativeCurrencyUsdPrice || !items || !stakablePair

  return (
    <>
      <Flex flexDirection="column">
        <Box mb="8px">
          {overallLoading ? (
            <LoadingList isMobile={true} itemsAmount={responsiveItemsPerPage} />
          ) : itemsPage.length > 0 ? (
            <ListLayout>
              {itemsPage.map(item => {
                if (item.campaign instanceof SingleSidedLiquidityMiningCampaign) {
                  return (
                    <UndecoratedLink
                      key={item.campaign.address}
                      to={`/pools/${item.campaign.stakeToken.address}/${item.campaign.address}/singleSidedStaking`}
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
                  const token0 = stakablePair?.token0
                  const token1 = stakablePair?.token1
                  return (
                    <UndecoratedLink
                      key={item.campaign.address}
                      to={`/pools/${token0?.address}/${token1?.address}/${item.campaign.address}`}
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
            </ListLayout>
          ) : (
            <Empty>
              <Text fontSize="12px" fontWeight="700" lineHeight="15px" letterSpacing="0.08em">
                NO REWARD POOLS HERE YET
              </Text>
            </Empty>
          )}
        </Box>
        <Box alignSelf="flex-end" mt="16px">
          <Pagination
            page={page}
            totalItems={items?.length ?? 0}
            itemsPerPage={responsiveItemsPerPage}
            onPageChange={setPage}
          />
        </Box>
      </Flex>
    </>
  )
}
