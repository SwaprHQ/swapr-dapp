import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'

import { useActiveWeb3React } from '../../../hooks'
import { useSWPRToken } from '../../../hooks/swpr/useSWPRToken'
import { useIsMobileByMedia } from '../../../hooks/useIsMobileByMedia'
import { useNativeCurrencyUSDPrice } from '../../../hooks/useNativeCurrencyUSDPrice'
import { usePage } from '../../../hooks/usePage'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { getStakedAmountUSD } from '../../../utils/liquidityMining'
import { ButtonPrimary } from '../../Button'
import { Pagination } from '../../Pagination'
import { DimBlurBgBox } from '../DimBlurBgBox/styleds'
import { ListLayout, LoadingList } from './LoadingList'
import { Pair as PairCard } from './Pair'
import { Header, HeaderText, PaginationRow, StyledUndecoratedLink } from './PairsList.styles'
import { PairsListProps } from './PairsList.types'

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
    <Flex flexDirection="column">
      <DimBlurBgBox>
        {loading ? (
          <LoadingList />
        ) : itemsPage.length > 0 || singleSidedStake ? (
          <ListLayout>
            {!isMobile && (
              <HeaderText>
                <Header justifyContent="space-between" paddingX="22px" paddingY="12px">
                  <Flex flex="25%">{t('Pair')}</Flex>
                  <Flex flex="25%">{t('Campaigns')}</Flex>
                  <Flex flex="45%">
                    <Flex flex="30%">{t('TVL')}</Flex>
                    <Flex flex="30%">{t('24hVolume')}</Flex>
                    <Flex flex="10%">{t('APY')}</Flex>
                  </Flex>
                </Header>
              </HeaderText>
            )}
            {singleSidedStake && !loadingNativeCurrencyUsdPrice && page === 1 && (
              <StyledUndecoratedLink
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
              </StyledUndecoratedLink>
            )}
            {itemsPage.length > 0 &&
              itemsPage.map(aggregatedPair => {
                return (
                  <StyledUndecoratedLink
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
                  </StyledUndecoratedLink>
                )
              })}
          </ListLayout>
        ) : (
          <Flex alignItems="center" justifyContent="center" flexDirection={'column'} my="50px">
            <Text fontSize="16px" color="#BCB3F0" mb="24px">
              {t('noPoolsFound')}
            </Text>
            <div>
              <ButtonPrimary to="/pools/create" as={Link}>
                {t('createAPool')}
              </ButtonPrimary>
            </div>
          </Flex>
        )}
      </DimBlurBgBox>
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
