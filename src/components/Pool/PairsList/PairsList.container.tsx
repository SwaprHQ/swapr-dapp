import React, { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import { useTranslation } from 'react-i18next'

import { usePage } from '../../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { useActiveWeb3React } from '../../../hooks'
import { useSWPRToken } from '../../../hooks/swpr/useSWPRToken'
import { useNativeCurrencyUSDPrice } from '../../../hooks/useNativeCurrencyUSDPrice'

import { Pagination } from '../../Pagination'
import { LoadingList } from '../LoadingList'
import { UndecoratedLink } from '../../UndercoratedLink'
import { Pair as PairCard } from './Pair'
import { getStakedAmountUSD } from '../../../utils/liquidityMining'
import { PairsListProps } from './PairsList.types'
import { BlueButton, DimBgContainer, Header, HeaderText, PaginationRow } from './PairsList.styles'
import { ListLayout } from '../LoadingList'

export function PairsList({ aggregatedPairs, loading, filter, singleSidedStake }: PairsListProps) {
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
      <DimBgContainer>
        {loading ? (
          <LoadingList />
        ) : itemsPage.length > 0 || singleSidedStake ? (
          <ListLayout>
            <Header>
              <HeaderText>{t('Pair')}</HeaderText>
              <HeaderText>{t('Campaigns')}</HeaderText>
              <HeaderText>{t('TVL')}</HeaderText>
              <HeaderText>{t('24hVolume')}</HeaderText>
              <HeaderText>{t('APY')}</HeaderText>
            </Header>
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
          <Flex alignItems="center" justifyContent="center" flexDirection={'column'}>
            <Text fontSize="16px" color="#BCB3F0" mb="24px">
              {t('noPoolsFound')}
            </Text>
            <BlueButton> {t('createAPool')}</BlueButton>
          </Flex>
        )}
      </DimBgContainer>
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
