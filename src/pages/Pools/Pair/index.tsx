import { JSBI, Pair as PairType, Percent } from '@swapr/sdk'

import { useCallback, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonBadge, ButtonPurpleDim } from '../../../components/Button'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import List from '../../../components/LiquidityMiningCampaigns/List'
import { PoolStats } from '../../../components/Pool/PairView/PoolStats'
import { UserLiquidity } from '../../../components/Pool/PairView/UserLiquidity'
import { ValueWithLabel } from '../../../components/Pool/PairView/ValueWithLabel'
import { RowBetween, RowFixed } from '../../../components/Row'
import { PairSearchModal } from '../../../components/SearchModal/PairSearchModal'
import { PairState, usePair } from '../../../data/Reserves'
import { useToken } from '../../../hooks/Tokens'
import { usePairLiquidityMiningCampaigns } from '../../../hooks/usePairLiquidityMiningCampaigns'
import { useRouter } from '../../../hooks/useRouter'
import { BlurBox } from '../../../ui/BlurBox'
import { PageWrapper } from '../../../ui/PageWrapper'
import { unwrappedToken } from '../../../utils/wrappedCurrency'

type CurrencySearchParams = {
  currencyIdA: string
  currencyIdB: string
}

export default function Pair() {
  const { navigate } = useRouter()
  const { currencyIdA, currencyIdB } = useParams<CurrencySearchParams>()
  const token0 = useToken(currencyIdA)
  const token1 = useToken(currencyIdB)

  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const [openPairsModal, setOpenPairsModal] = useState(false)
  const { t } = useTranslation('pool')
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
    (pair: PairType) => {
      navigate(`/pools/${pair.token0.address}/${pair.token1.address}`)
    },
    [navigate]
  )

  if (token0 && (wrappedPair[0] === PairState.NOT_EXISTS || wrappedPair[0] === PairState.INVALID)) {
    return <Navigate to="/pools" replace />
  }

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
                {t('pair.trade')}
              </ButtonPurpleDim>
            </ButtonRow>
          </TitleRow>
          <ContentGrid>
            <TwoColumnsGrid>
              <PoolStats loading={wrappedPair[1] === null} pair={wrappedPair[1]} />
              <BlurBox padding="24px">
                <Flex alignItems="center" justifyContent="space-between" flexDirection={'column'} height="100%">
                  <Box mb={3}>
                    <ValueWithLabel
                      title={t('pair.swapFee')}
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
                    {t('pair.governance')}
                  </ButtonBadge>
                </Flex>
              </BlurBox>
            </TwoColumnsGrid>
            <UserLiquidity pair={wrappedPair[1] || undefined} />
          </ContentGrid>
          <Flex my={3}>
            <ButtonBadge
              number={miningCampaigns.active.length}
              color={miningCampaigns.active.length > 0 ? 'green' : 'orange'}
              to={token0 && token1 ? `/rewards/${token0.address}/${token1.address}` : ''}
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

const TitleRow = styled(RowBetween)`
  margin-bottom: 24px;

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

const ButtonRow = styled(RowFixed)`
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 8px;
  `};
`

const TwoColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.4fr;
  grid-gap: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 24px;
`
