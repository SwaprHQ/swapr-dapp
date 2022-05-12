import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Text } from 'rebass'
import { ChevronDown } from 'react-feather'
import { JSBI, Percent } from '@swapr/sdk'
import { useTranslation } from 'react-i18next'

import { useToken } from '../../../hooks/Tokens'
import { useRouter } from '../../../hooks/useRouter'
import { unwrappedToken } from '../../../utils/wrappedCurrency'

import { PageWrapper } from '../../../components/PageWrapper'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import { RowBetween, RowFixed } from '../../../components/Row'
import { PairState, usePair } from '../../../data/Reserves'
import PairSearchModal from '../../../components/SearchModal/PairSearchModal'
import { ButtonPurpleDim, ButtonWithBadge } from '../../../components/Button'
import PoolStats from '../../../components/Pool/PairView/PoolStats'
import YourLiquidity from '../../../components/Pool/PairView/YourLiquidity'
import { DimBlurBgBox } from '../../../components/Pool/DimBlurBgBox'
import { InfoSnippet } from '../../../components/Pool/PairView/InfoSnippet'

export default function Pair({
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
        <Box paddingX={3}>
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
              <ButtonPurpleDim disabled>{t('trade')}</ButtonPurpleDim>
            </ButtonRow>
          </TitleRow>
          <ContentGrid>
            <TwoColumnsGrid>
              <PoolStats loading={wrappedPair[1] === null} pair={wrappedPair[1]} />
              <DimBlurBgBox padding={'24px'}>
                <Flex alignItems="center" justifyContent="space-between" flexDirection={'column'} height="100%">
                  <Box>
                    <InfoSnippet
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
                  <ButtonWithBadge link={'#'} number={0} disabled={true}>
                    {t('governance')}
                  </ButtonWithBadge>
                </Flex>
              </DimBlurBgBox>
            </TwoColumnsGrid>
            <YourLiquidity pair={wrappedPair[1] || undefined}></YourLiquidity>
          </ContentGrid>
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
