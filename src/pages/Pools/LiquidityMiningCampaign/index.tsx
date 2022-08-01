import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Navigate, NavLink, useParams } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { AutoColumn } from '../../../components/Column'
import { CurrencyLogo } from '../../../components/CurrencyLogo'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import { SwapPoolTabs } from '../../../components/NavigationTabs'
import LiquidityMiningCampaignView from '../../../components/Pool/LiquidityMiningCampaignView'
import { RowBetween, RowFixed } from '../../../components/Row'
import { UndecoratedLink } from '../../../components/UndercoratedLink'
import { PairState, usePair } from '../../../data/Reserves'
import { useActiveWeb3React } from '../../../hooks'
import { useSingleSidedCampaign } from '../../../hooks/singleSidedStakeCampaigns/useSingleSidedCampaign'
import { useToken } from '../../../hooks/Tokens'
import { useLiquidityMiningCampaign } from '../../../hooks/useLiquidityMiningCampaign'
import { useRouter } from '../../../hooks/useRouter'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../../../ui/PageWrapper'
import { currencyId } from '../../../utils/currencyId'
import { unwrappedToken } from '../../../utils/wrappedCurrency'
import { ResponsiveButtonPrimary, ResponsiveButtonSecondary } from '../../LiquidityMining/styleds'

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
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

export default function LiquidityMiningCampaign() {
  const { account } = useActiveWeb3React()
  const { location, searchParams: search } = useRouter()
  const { liquidityMiningCampaignId, currencyIdA, currencyIdB } = useParams<{
    currencyIdA: string
    currencyIdB?: string
    liquidityMiningCampaignId: string
  }>()

  const token0 = useToken(currencyIdA)
  const token1 = useToken(currencyIdB)
  const isSingleSidedCampaign = location.pathname.includes('/single-sided-campaign')

  const { singleSidedStakingCampaign, loading: singleSidedCampaignLoading } = useSingleSidedCampaign(
    liquidityMiningCampaignId!
  )

  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const pairOrUndefined = useMemo(() => wrappedPair[1] || undefined, [wrappedPair])
  const { campaign, containsKpiToken, loading } = useLiquidityMiningCampaign(pairOrUndefined, liquidityMiningCampaignId)

  const lpTokenBalance = useTokenBalance(account || undefined, wrappedPair[1]?.liquidityToken)

  if (
    (token0 === undefined &&
      token1 === undefined &&
      (wrappedPair[0] === PairState.NOT_EXISTS || wrappedPair[0] === PairState.INVALID)) ||
    (wrappedPair[0] === PairState.INVALID && token0 === undefined && token1 === undefined)
  ) {
    return <Navigate to="/rewards" replace />
  }
  const AddLiquidityButtonComponent =
    lpTokenBalance && lpTokenBalance.equalTo('0') ? ResponsiveButtonPrimary : ResponsiveButtonSecondary

  const showSingleSidedCampaignLoader = isSingleSidedCampaign && (token0 === null || singleSidedCampaignLoading)
  const showCampaignLoader = !isSingleSidedCampaign && (token1 === null || token0 === null)

  return (
    <PageWrapper>
      <SwapPoolTabs active="pool" />
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <Flex alignItems="center">
              <Box mr="8px">
                <UndecoratedLink to={{ pathname: '/rewards', search: search.toString() }}>
                  <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px" color="text4">
                    Rewards
                  </TYPE.MediumHeader>
                </UndecoratedLink>
              </Box>
              <Box mr="8px">
                <TYPE.MediumHeader fontWeight="400" fontSize="26px" lineHeight="32px" color="text4">
                  /
                </TYPE.MediumHeader>
              </Box>
              <Box mr="4px">
                {isSingleSidedCampaign ? (
                  <CurrencyLogo currency={token0 ?? undefined} loading={token0 === null} />
                ) : (
                  <DoubleCurrencyLogo
                    loading={token0 === null || token1 === null}
                    currency0={token0 ?? undefined}
                    currency1={token1 ?? undefined}
                    size={20}
                  />
                )}
              </Box>
              <Box>
                <TYPE.Small color="text4" fontWeight="600" fontSize="16px" lineHeight="20px">
                  {showSingleSidedCampaignLoader || showCampaignLoader ? (
                    <Skeleton width="60px" />
                  ) : isSingleSidedCampaign ? (
                    unwrappedToken(token0!)?.symbol
                  ) : (
                    `${unwrappedToken(token0!)?.symbol}/${unwrappedToken(token1!)?.symbol}`
                  )}
                </TYPE.Small>
              </Box>
            </Flex>
            <ButtonRow>
              <NavLink
                to={
                  isSingleSidedCampaign && token0
                    ? `/swap/${token0.address}`
                    : token0 && token1
                    ? `/pools/add/${currencyId(token0)}/${currencyId(token1)}`
                    : ''
                }
              >
                <AddLiquidityButtonComponent padding="8px 14px">
                  <Text fontWeight={700} fontSize={12}>
                    {isSingleSidedCampaign ? `GET ${token0?.symbol ?? 'TOKEN'}` : 'ADD LIQUIDITY'}
                  </Text>
                </AddLiquidityButtonComponent>
              </NavLink>
            </ButtonRow>
          </TitleRow>
          {((!isSingleSidedCampaign && !loading) || (!singleSidedCampaignLoading && isSingleSidedCampaign)) && (
            <LiquidityMiningCampaignView
              isSingleSidedStake={isSingleSidedCampaign}
              campaign={isSingleSidedCampaign ? singleSidedStakingCampaign : campaign}
              containsKpiToken={containsKpiToken}
            />
          )}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
