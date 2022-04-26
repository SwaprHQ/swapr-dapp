import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Flex, Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { BigintIsh, CurrencyAmount, Pair, Percent, SingleSidedLiquidityMiningCampaign } from '@swapr/sdk'

import { usePage } from '../../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { useActiveWeb3React } from '../../../hooks'
import { useSWPRToken } from '../../../hooks/swpr/useSWPRToken'
import { useNativeCurrencyUSDPrice } from '../../../hooks/useNativeCurrencyUSDPrice'

import { Pagination } from '../../Pagination'
import { LoadingList } from '../LoadingList'
import { UndecoratedLink } from '../../UndercoratedLink'
import PairCard from './Pair'
import { PairsFilterType } from '../ListFilter'
import { getStakedAmountUSD } from '../../../utils/liquidityMining'
import { gradients } from '../../../utils/theme'

export interface AggregatedPairs {
  pair: Pair
  liquidityUSD: CurrencyAmount
  maximumApy: Percent
  staked?: boolean
  containsKpiToken?: boolean
  hasFarming?: boolean
  startsAt?: BigintIsh
}
interface PairsListProps {
  aggregatedPairs: AggregatedPairs[]
  singleSidedStake?: SingleSidedLiquidityMiningCampaign
  hasActiveCampaigns?: boolean
  filter?: PairsFilterType
  loading?: boolean
  hasSingleSidedStake?: boolean
}

export default function PairsList({ aggregatedPairs, loading, filter, singleSidedStake }: PairsListProps) {
  const { chainId } = useActiveWeb3React()
  const [page, setPage] = useState(1)
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const itemsPage = usePage(aggregatedPairs, responsiveItemsPerPage, page, 0)
  const { address: swprAddress } = useSWPRToken()
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  const { t } = useTranslation()

  useEffect(() => {
    // reset page when connected chain or selected filter changes
    setPage(1)
  }, [chainId, filter, aggregatedPairs])
  const isSWPRSingleSidedStake = singleSidedStake?.stakeToken.address.toLowerCase() === swprAddress.toLowerCase()

  return (
    <Flex flexDirection="column">
      <Box>
        {loading ? (
          <LoadingList />
        ) : itemsPage.length > 0 || singleSidedStake ? (
          <ListLayout>
            {singleSidedStake && !loadingNativeCurrencyUsdPrice && page === 1 && (
              <UndecoratedLink
                key={singleSidedStake.address}
                to={
                  isSWPRSingleSidedStake
                    ? () => ({ pathname: '/rewards', state: { showSwpr: true } })
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
          </ListLayout>
        ) : (
          <DimBgContainer>
            <Flex alignItems="center" justifyContent="center" flexDirection={'column'}>
              <Text fontSize="16px" color="#BCB3F0" mb="24px">
                {t('noPoolsFound')}
              </Text>
              <BlueButton> {t('createAPool')}</BlueButton>
            </Flex>
          </DimBgContainer>
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

const ListLayout = styled.div`
  display: grid;
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

const DimBgContainer = styled.div`
  width: 100%;
  padding: 48px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.purple5};

  background: ${gradients.purpleDim};
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);
`

const BlueButton = styled.button`
  outline: none;

  display: flex;
  justify-content: center;
  align-items: center;

  border: none;
  border-radius: 12px;
  padding: 10px 14px;

  background-color: ${({ theme }) => theme.primary1};

  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.white};
  text-transform: uppercase;

  cursor: pointer;
`
