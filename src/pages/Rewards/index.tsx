import { Pair } from '@swapr/sdk'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as ThreeBlurredCircles } from '../../assets/svg/three-blurred-circles.svg'
import { ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { RewardsList } from '../../components/LiquidityMiningCampaigns/RewardsList'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { PairsFilterType } from '../../components/Pool/ListFilter'
import { RowBetween, RowFixed } from '../../components/Row'
import { PairSearchModal } from '../../components/SearchModal/PairSearchModal'
import { PairState, usePair } from '../../data/Reserves'
import { useToken } from '../../hooks/Tokens'
import { useLiquidityMiningFeatureFlag } from '../../hooks/useLiquidityMiningFeatureFlag'
import { useRouter } from '../../hooks/useRouter'
import { TYPE } from '../../theme'
import { PageWrapper } from '../../ui/PageWrapper'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ResetFilterIcon, ResetFilterIconContainer } from '../Pools'

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const PointableFlex = styled(Flex)`
  border: solid 1px ${props => props.theme.bg3};
  border-radius: 8px;
  height: 36px;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 8px;
  `};
`
type CurrencySearchParams = {
  currencyIdA: string
  currencyIdB: string
}

export default function Rewards() {
  const { navigate, location, searchParams: search } = useRouter()
  const { currencyIdA, currencyIdB } = useParams<CurrencySearchParams>()

  const token0 = useToken(currencyIdA)
  const token1 = useToken(currencyIdB)

  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const [aggregatedDataFilter, setAggregatedDataFilter] = useState(PairsFilterType.ALL)
  const [filterPair, setFilterPair] = useState<Pair | null>(null)

  const liquidityMiningEnabled = useLiquidityMiningFeatureFlag()
  const [openPairsModal, setOpenPairsModal] = useState(false)

  useEffect(() => {
    if (filterPair) return
    if (wrappedPair[0] === PairState.NOT_EXISTS || wrappedPair[0] === PairState.LOADING) setFilterPair(null)
    else if (wrappedPair[0] === PairState.EXISTS && !filterPair) setFilterPair(wrappedPair[1])
  }, [wrappedPair, filterPair])

  const handleAllClick = useCallback(() => {
    setOpenPairsModal(true)
  }, [])

  useEffect(() => {
    if (typeof location.state === 'object' && location.state !== null && 'showSwpr' in location.state) {
      setAggregatedDataFilter(PairsFilterType.SWPR)
    }
  }, [location])

  const handleModalClose = useCallback(() => {
    setOpenPairsModal(false)
  }, [])

  const handlePairSelect = useCallback(
    (pair: Pair) => {
      navigate(`/rewards/${pair.token0.address}/${pair.token1.address}`)
      setFilterPair(pair)
    },
    [navigate]
  )
  const handleFilterTokenReset = useCallback(
    (e: React.MouseEvent<Element>) => {
      setAggregatedDataFilter(PairsFilterType.ALL)
      setFilterPair(null)

      navigate(`/rewards`)
      e.stopPropagation()
    },
    [navigate]
  )

  if (token0 && (wrappedPair[0] === PairState.NOT_EXISTS || wrappedPair[0] === PairState.INVALID)) {
    return <Navigate to={{ pathname: '/rewards', search: search.toString() }} />
  }

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active="pool" />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <Flex alignItems="center">
                <Box mr="8px">
                  <TYPE.MediumHeader
                    onClick={handleFilterTokenReset}
                    style={{ cursor: 'pointer' }}
                    fontWeight="400"
                    fontSize="26px"
                    lineHeight="32px"
                    color="text4"
                  >
                    Rewards
                  </TYPE.MediumHeader>
                </Box>
                <Box mr="8px">
                  <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px" color="text4">
                    /
                  </TYPE.MediumHeader>
                </Box>
                <PointableFlex onClick={handleAllClick}>
                  {!filterPair && wrappedPair[0] === PairState.LOADING && (
                    <Box mr="6px" height="21px">
                      <ThreeBlurredCircles />
                    </Box>
                  )}
                  {filterPair && (
                    <Box mr="4px">
                      <DoubleCurrencyLogo
                        loading={!filterPair.token0 || !filterPair.token1}
                        currency0={filterPair.token0 || undefined}
                        currency1={filterPair.token1 || undefined}
                        size={20}
                      />
                    </Box>
                  )}
                  <Box mr="4px">
                    <Text fontWeight="600" fontSize="16px" lineHeight="20px" data-testid="all-pairs">
                      {filterPair
                        ? `${unwrappedToken(filterPair.token0)?.symbol}/${unwrappedToken(filterPair.token1)?.symbol}`
                        : wrappedPair[0] === PairState.LOADING
                        ? 'LOADING'
                        : aggregatedDataFilter === PairsFilterType.MY
                        ? 'ALL'
                        : aggregatedDataFilter === PairsFilterType.SWPR
                        ? 'SWAPR'
                        : 'ALL'}
                    </Text>
                  </Box>

                  {aggregatedDataFilter !== PairsFilterType.ALL || filterPair ? (
                    <Box ml="6px">
                      <ResetFilterIconContainer onClick={handleFilterTokenReset}>
                        <ResetFilterIcon />
                      </ResetFilterIconContainer>
                    </Box>
                  ) : (
                    <Box>
                      <ChevronDown size={12} />
                    </Box>
                  )}
                </PointableFlex>
              </Flex>
              <ButtonRow>
                {liquidityMiningEnabled && (
                  <ResponsiveButtonSecondary
                    as={Link}
                    padding="8px 14px"
                    to={{
                      pathname: '/liquidity-mining/create',
                      search: search.toString(),
                    }}
                    data-testid="create-campaign"
                  >
                    <Text fontWeight={700} fontSize={12} lineHeight="15px">
                      CREATE CAMPAIGN
                    </Text>
                  </ResponsiveButtonSecondary>
                )}
              </ButtonRow>
            </TitleRow>
          </AutoColumn>
        </AutoColumn>
        <RewardsList
          pair={
            filterPair !== null && filterPair.token0 !== undefined && filterPair.token1 !== undefined
              ? filterPair
              : undefined
          }
          loading={wrappedPair[0] === PairState.LOADING}
          dataFilter={aggregatedDataFilter}
          setDataFiler={setAggregatedDataFilter}
        />
      </PageWrapper>
      <PairSearchModal isOpen={openPairsModal} onDismiss={handleModalClose} onPairSelect={handlePairSelect} />
    </>
  )
}
