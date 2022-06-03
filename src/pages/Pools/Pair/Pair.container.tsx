import React, { useCallback, useState } from 'react'
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Text } from 'rebass'
import { ChevronDown } from 'react-feather'
import { JSBI, Percent } from '@swapr/sdk'
import { useTranslation } from 'react-i18next'

import { useToken } from '../../../hooks/Tokens'
import { useRouter } from '../../../hooks/useRouter'
import { unwrappedToken } from '../../../utils/wrappedCurrency'
import { PairState, usePair } from '../../../data/Reserves'
import { PageWrapper } from '../../../components/PageWrapper'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import { ButtonPurpleDim, ButtonBadge } from '../../../components/Button'
import { PoolStats } from '../../../components/Pool/PairView/PoolStats'
import { UserLiquidity } from '../../../components/Pool/PairView/UserLiquidity'
import { DimBlurBgBox } from '../../../components/Pool/DimBlurBgBox'
import { ValueWithLabel } from '../../../components/Pool/PairView/ValueWithLabel/ValueWithLabel.component'
import List from '../../../components/LiquidityMiningCampaigns/List'
import { usePairLiquidityMiningCampaigns } from '../../../hooks/usePairLiquidityMiningCampaigns'
import { PairSearchModal } from '../../../components/SearchModal/PairSearchModal'
import { ButtonRow, ContentGrid, PointableFlex, TitleRow, TwoColumnsGrid } from './Pair.styles'

export function Pair({
  match: {
    params: { currencyIdA, currencyIdB },
  },
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const router = useRouter()
  const token0 = useToken(currencyIdA)
  const token1 = useToken(currencyIdB)

  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const [openPairsModal, setOpenPairsModal] = useState(false)
  const { t } = useTranslation()
  const { loading: loadingPairs, miningCampaigns } = usePairLiquidityMiningCampaigns(
    wrappedPair[1] ? wrappedPair[1] : undefined
  )

  const handleAllClick = useCallback(() => {
    setOpenPairsModal(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setOpenPairsModal(false)
  }, [])

  const handlePairSelect = useCallback(
    pair => {
      router.push({
        pathname: `/pools/${pair.token0.address}/${pair.token1.address}`,
      })
    },
    [router]
  )

  if (token0 && (wrappedPair[0] === PairState.NOT_EXISTS || wrappedPair[0] === PairState.INVALID))
    return <Redirect to="/pools" />
  return (
    <>
      <PageWrapper>
        <Box paddingX={2}>
          <TitleRow>
            <Flex alignItems="center">
              <PointableFlex onClick={handleAllClick}>
                <Box mr="4px">
                  <DoubleCurrencyLogo
                    loading={!token0 || !token1}
                    currency0={token0 || undefined}
                    currency1={token1 || undefined}
                    size={20}
                  />
                </Box>
                <Box mr="4px">
                  <Text fontWeight="600" fontSize="16px" lineHeight="20px">
                    {!token0 || !token1 ? (
                      <Skeleton width="60px" />
                    ) : (
                      `${unwrappedToken(token0)?.symbol}/${unwrappedToken(token1)?.symbol}`
                    )}
                  </Text>
                </Box>
                <Box>
                  <ChevronDown size={12} />
                </Box>
              </PointableFlex>
            </Flex>
            <ButtonRow>
              <ButtonPurpleDim
                as={Link}
                to={token0 && token1 ? `/swap?inputCurrency=${token0.address}&outputCurrency=${token1.address}` : ''}
              >
                {t('trade')}
              </ButtonPurpleDim>
            </ButtonRow>
          </TitleRow>
          <ContentGrid>
            <TwoColumnsGrid>
              <PoolStats loading={wrappedPair[1] === null} pair={wrappedPair[1]} />
              <DimBlurBgBox padding={'24px'}>
                <Flex alignItems="center" justifyContent="space-between" flexDirection={'column'} height="100%">
                  <Box mb={3}>
                    <ValueWithLabel
                      title={t('swapFee')}
                      value={
                        wrappedPair[1]
                          ? new Percent(
                              JSBI.BigInt(wrappedPair[1].swapFee.toString()),
                              JSBI.BigInt(10000)
                            ).toSignificant(3) + '%'
                          : '-'
                      }
                      big
                      center
                    />
                  </Box>
                  <ButtonBadge to={'#'} number={0} disabled>
                    {t('governance')}
                  </ButtonBadge>
                </Flex>
              </DimBlurBgBox>
            </TwoColumnsGrid>
            <UserLiquidity pair={wrappedPair[1] || undefined} />
          </ContentGrid>
          <Flex my={3}>
            <ButtonBadge
              number={miningCampaigns.active.length}
              color={miningCampaigns.active.length > 0 ? 'green' : 'orange'}
              to={token0 && token1 ? `/rewards/${token0.address}/${token1.address}` : ''}
              fit
            >
              {t('campaigns')}
            </ButtonBadge>
          </Flex>
          {!loadingPairs ? <List items={miningCampaigns.active} /> : <List loading loadingItems={3} />}
        </Box>
      </PageWrapper>
      <PairSearchModal isOpen={openPairsModal} onDismiss={handleModalClose} onPairSelect={handlePairSelect} />
    </>
  )
}
