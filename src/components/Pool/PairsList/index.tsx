import React, { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import Pagination from '../../Pagination'
import LoadingList from '../LoadingList'
import { UndecoratedLink } from '../../UndercoratedLink'
import PairCard from './Pair'
import { CurrencyAmount, Pair, Percent } from '@swapr/sdk'
import Empty from '../Empty'
import styled from 'styled-components'
import { usePage } from '../../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { useActiveWeb3React } from '../../../hooks'
import { PairsFilterType } from '../ListFilter'
import { SingleSidedLiquidityMiningCampaign } from 'violet-swapr'
// import { useSignelSidedStakeCampaigns } from '../../../hooks/useSingleSidedStakeCampaigns'

const ListLayout = styled.div`
  display: grid;
  //this should be toogleble as well to 1fr 1fr 1fr
  grid-template-columns: auto;
  grid-gap: 8px;
`

const PaginationRow = styled(Flex)`
  width: 100%;
  justify-content: flex-end;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
  `};

  & ul {
    margin: 22px 0;
  }
`

interface PairsListProps {
  aggregatedPairs: {
    pair: Pair
    liquidityUSD: CurrencyAmount
    maximumApy: Percent
    staked?: boolean
    containsKpiToken?: boolean
    hasFarming?: boolean
  }[]
  singleSidedStake?: SingleSidedLiquidityMiningCampaign | undefined
  hasActiveCampaigns?: boolean
  filter?: PairsFilterType
  loading?: boolean
}

// enum Layout {
//   LIST,
//   GRID
// }

export default function PairsList({
  aggregatedPairs,
  loading,
  filter,
  singleSidedStake,
  hasActiveCampaigns
}: PairsListProps) {
  const { chainId } = useActiveWeb3React()
  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const itemsPage = usePage(aggregatedPairs, responsiveItemsPerPage, page, 0)

  // const [layoutSwitch, setLayoutSwitch] = useState<Layout>(Layout.LIST)
  useEffect(() => {
    // reset page when connected chain or selected filter changes
    setPage(1)
  }, [chainId, filter, aggregatedPairs])

  return (
    <Flex flexDirection="column">
      <Box>
        {loading ? (
          <LoadingList />
        ) : itemsPage.length > 0 ? (
          <ListLayout>
            {hasActiveCampaigns && singleSidedStake && (
              <UndecoratedLink
                key={singleSidedStake.stakeToken.id}
                to={`/pools/${singleSidedStake.stakeToken.address}/${singleSidedStake.address}/singleSidedStaking`}
              >
                <PairCard
                  token0={singleSidedStake.stakeToken}
                  pair={singleSidedStake.stakeToken.address}
                  usdLiquidity={singleSidedStake.staked}
                  apy={itemsPage[0].maximumApy}
                  hasFarming={true}
                  isSingleSidedStakingCampaign={true}
                />
              </UndecoratedLink>
            )}
            {itemsPage.map(aggregatedPair => {
              return (
                <UndecoratedLink
                  key={aggregatedPair.pair.liquidityToken.address}
                  to={`/pools/${aggregatedPair.pair.token0.address}/${aggregatedPair.pair.token1.address}`}
                >
                  <PairCard
                    token0={aggregatedPair.pair.token0}
                    token1={aggregatedPair.pair.token1}
                    pair={aggregatedPair.pair}
                    usdLiquidity={aggregatedPair.liquidityUSD}
                    apy={aggregatedPair.maximumApy}
                    containsKpiToken={aggregatedPair.containsKpiToken}
                    hasFarming={aggregatedPair.hasFarming}
                  />
                </UndecoratedLink>
              )
            })}
          </ListLayout>
        ) : (
          <Empty>
            <Text fontSize="12px" fontWeight="700" lineHeight="15px" letterSpacing="0.08em">
              NO PAIRS YET
            </Text>
          </Empty>
        )}
      </Box>
      {aggregatedPairs.length > responsiveItemsPerPage && (
        <PaginationRow>
          <Box>
            <Pagination
              page={page}
              totalItems={aggregatedPairs.length + 1}
              itemsPerPage={responsiveItemsPerPage}
              onPageChange={setPage}
            />
          </Box>
        </PaginationRow>
      )}
    </Flex>
  )
}
