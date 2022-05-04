import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { PageWrapper } from '../../components/PageWrapper'

import { TYPE } from '../../theme'
import { Box, Button, Flex, Text } from 'rebass'
import { RowBetween } from '../../components/Row'
import { ButtonWithLink } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { ReactComponent as ThreeBlurredCircles } from '../../assets/svg/three-blurred-circles.svg'
import { ChevronDown, Plus, X } from 'react-feather'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { Currency, Token } from '@swapr/sdk'

import { useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator } from '../../hooks/useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator'
import { PairsFilterType } from '../../components/Pool/ListFilter'
import { useLPPairs } from '../../hooks/useLiquidityPositions'
import { PairsList } from '../../components/Pool/PairsList'
import CurrencyLogo from '../../components/CurrencyLogo'
import { useSwaprSinglelSidedStakeCampaigns } from '../../hooks/singleSidedStakeCampaigns/useSwaprSingleSidedStakeCampaigns'
import { Switch } from '../../components/Switch'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { SortByDropdown } from '../../components/Pool/SortByDropdown'
import { LIQUIDITY_SORTING_TYPES } from '../../constants'
import { SpaceBg } from '../../components/SpaceBg'

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    width: 100%;
    flex-direction: column;
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

const TransperentButton = styled(Button)`
  display: flex;
  align-items: center;
  margin-left: 18px;
  color: ${props => props.theme.text4};
`

export const ResetFilterIconContainer = styled(Flex)`
  border: solid 1px ${props => props.theme.bg3};
  border-radius: 8px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`

export const ResetFilterIcon = styled(X)`
  width: 12px;
  height: 12px;
  color: ${props => props.theme.purple3};
`

interface TitleProps {
  filteredToken?: Token
  onCurrencySelection: (currency: Currency) => void
  onFilteredTokenReset: () => void
  aggregatedDataFilter: PairsFilterType
  onFilterChange: any
  onSortByChange: (sortBy: string) => void
  sortBy: string
}

// decoupling the title from the rest of the component avoids full-rerender everytime the pair selection modal is opened
function Title({
  onCurrencySelection,
  filteredToken,
  onFilteredTokenReset,
  aggregatedDataFilter,
  onFilterChange,
  onSortByChange,
  sortBy,
}: TitleProps) {
  const [openTokenModal, setOpenTokenModal] = useState(false)

  const handleAllClick = useCallback(() => {
    setOpenTokenModal(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setOpenTokenModal(false)
  }, [])

  const handleResetFilterLocal = useCallback(
    (e: any) => {
      onFilteredTokenReset()
      e.stopPropagation()
    },
    [onFilteredTokenReset]
  )

  return (
    <>
      <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
        <Flex alignItems="center" justifyContent="space-between">
          {aggregatedDataFilter === PairsFilterType.MY ? (
            <Box>
              <TYPE.mediumHeader fontWeight="400" fontSize="26px" lineHeight="32px">
                MY PAIRS
              </TYPE.mediumHeader>
            </Box>
          ) : (
            <PointableFlex onClick={handleAllClick}>
              {!filteredToken && (
                <Box mr="6px" height="21px">
                  <ThreeBlurredCircles />
                </Box>
              )}
              {filteredToken && (
                <Box mr="8px">
                  <CurrencyLogo currency={filteredToken} size="21px" />
                </Box>
              )}
              <Text mr="8px" fontWeight="600" fontSize="16px" lineHeight="20px" data-testid="all-token-list">
                {filteredToken ? unwrappedToken(filteredToken)?.symbol : 'ALL'}
              </Text>
              <Box>
                <ChevronDown size={12} />
              </Box>
              {filteredToken && (
                <Box ml="6px">
                  <ResetFilterIconContainer onClick={handleResetFilterLocal}>
                    <ResetFilterIcon />
                  </ResetFilterIconContainer>
                </Box>
              )}
            </PointableFlex>
          )}

          <TransperentButton as={Link} to="/create">
            <Plus size="16" />
            <Text marginLeft="5px" fontWeight="500" fontSize="12px" data-testid="create-pair">
              ADD LIQUIDITY
            </Text>
          </TransperentButton>
        </Flex>
        <Flex data-testid="campaigns-toggle">
          <Switch
            label="CAMPAIGNS"
            handleToggle={() =>
              onFilterChange(
                aggregatedDataFilter === PairsFilterType.REWARDS ? PairsFilterType.ALL : PairsFilterType.REWARDS
              )
            }
            isOn={aggregatedDataFilter === PairsFilterType.REWARDS}
          />
          <Switch
            label="MY PAIRS"
            handleToggle={() =>
              onFilterChange(aggregatedDataFilter === PairsFilterType.MY ? PairsFilterType.ALL : PairsFilterType.MY)
            }
            isOn={aggregatedDataFilter === PairsFilterType.MY}
          />
          <SortByDropdown sortBy={sortBy} onSortByChange={onSortByChange} />
        </Flex>
      </TitleRow>
      <CurrencySearchModal
        isOpen={openTokenModal}
        onDismiss={handleModalClose}
        onCurrencySelect={onCurrencySelection}
        showNativeCurrency={false}
      />
    </>
  )
}

export default function Pools() {
  const { account, chainId } = useActiveWeb3React()
  const [filterToken, setFilterToken] = useState<Token | undefined>()
  const [aggregatedDataFilter, setAggregatedDataFilter] = useState(PairsFilterType.ALL)
  const [sortBy, setSortBy] = useState(LIQUIDITY_SORTING_TYPES.TVL)
  const { loading: loadingAggregatedData, aggregatedData } = useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator(
    aggregatedDataFilter,
    filterToken,
    sortBy
  )

  const { loading: ssLoading, data } = useSwaprSinglelSidedStakeCampaigns(filterToken, aggregatedDataFilter)

  const { loading: loadingUserLpPositions, data: userLpPairs } = useLPPairs(account || undefined)

  const handleCurrencySelect = useCallback(token => {
    setFilterToken(token as Token)
  }, [])

  const handleFilterTokenReset = useCallback(() => {
    setFilterToken(undefined)
  }, [])

  const handleSortBy = useCallback(sortBy => {
    setSortBy(sortBy)
  }, [])

  return (
    <SpaceBg>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="27px" style={{ width: '100%' }}>
            <Title
              aggregatedDataFilter={aggregatedDataFilter}
              onCurrencySelection={handleCurrencySelect}
              filteredToken={filterToken}
              onFilteredTokenReset={handleFilterTokenReset}
              onFilterChange={setAggregatedDataFilter}
              onSortByChange={handleSortBy}
              sortBy={sortBy}
            />
            {aggregatedDataFilter === PairsFilterType.MY ? (
              <PairsList loading={loadingUserLpPositions} aggregatedPairs={userLpPairs} singleSidedStake={data} />
            ) : (
              <PairsList
                loading={loadingUserLpPositions || loadingAggregatedData || ssLoading}
                aggregatedPairs={aggregatedData}
                singleSidedStake={data}
                filter={aggregatedDataFilter}
              />
            )}
          </AutoColumn>
        </AutoColumn>
        {account && (
          <ButtonWithLink
            link={`https://dxstats.eth.limo/#/account/${account}?chainId=${chainId}`}
            text={'ACCOUNT ANALYTICS AND ACCRUED FEES'}
            style={{ marginTop: '32px' }}
          />
        )}
      </PageWrapper>
    </SpaceBg>
  )
}
