import { Currency, Token } from '@swapr/sdk'

import { useCallback, useState } from 'react'
import { ChevronDown, Plus, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Box, Button, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as ThreeBlurredCircles } from '../../assets/svg/three-blurred-circles.svg'
import { ButtonWithExternalLink } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { CurrencyLogo } from '../../components/CurrencyLogo'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { PairsFilterType } from '../../components/Pool/ListFilter'
import { PairsList } from '../../components/Pool/PairsList'
import { SortByDropdown } from '../../components/Pool/SortByDropdown'
import { RowBetween } from '../../components/Row'
import { CurrencySearchModal } from '../../components/SearchModal/CurrencySearchModal'
import { Switch } from '../../components/Switch'
import { LIQUIDITY_SORTING_TYPES } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useSwaprSinglelSidedStakeCampaigns } from '../../hooks/singleSidedStakeCampaigns/useSwaprSingleSidedStakeCampaigns'
import { useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator } from '../../hooks/useAllPairsWithLiquidityAndMaximumApyAndStakingIndicator'
import { useLPPairs } from '../../hooks/useLiquidityPositions'
import { TYPE } from '../../theme'
import { PageWrapper } from '../../ui/StyledElements/PageWrapper'
import { getAccountAnalyticsLink } from '../../utils'
import { unwrappedToken } from '../../utils/wrappedCurrency'

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

export const StyledMediumHeader = styled(TYPE.MediumHeader)`
  text-transform: uppercase;
`

export const StyledText = styled(Text)`
  text-transform: uppercase;
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
  const { t } = useTranslation('pool')
  const [search] = useSearchParams()

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
        <Flex alignItems="center" justifyContent="space-between" marginBottom={[3, 0]}>
          {aggregatedDataFilter === PairsFilterType.MY ? (
            <Box>
              <StyledMediumHeader fontWeight="400" fontSize="26px" lineHeight="36px">
                {t('pairsList.myPairs')}
              </StyledMediumHeader>
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
              <StyledText mr="8px" fontWeight="600" fontSize="16px" lineHeight="20px" data-testid="all-token-list">
                {filteredToken ? unwrappedToken(filteredToken)?.symbol : t('all')}
              </StyledText>
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

          <TransperentButton as={Link} to={{ pathname: '/pools/create', search: search.toString() }}>
            <Plus size="16" />
            <StyledText marginLeft="5px" fontWeight="500" fontSize="12px" data-testid="create-pair">
              {t('addLiquidity')}
            </StyledText>
          </TransperentButton>
        </Flex>
        <Flex data-testid="campaigns-toggle">
          <Switch
            label={t('campaigns')}
            handleToggle={() =>
              onFilterChange(
                aggregatedDataFilter === PairsFilterType.REWARDS ? PairsFilterType.ALL : PairsFilterType.REWARDS
              )
            }
            isOn={aggregatedDataFilter === PairsFilterType.REWARDS}
          />
          <Switch
            label={t('pairsList.myPairs')}
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
  const { t } = useTranslation('pool')
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

  const handleCurrencySelect = useCallback((token: Currency) => {
    // Since Token extends Currency we are checking address in useSwaprSinglelSidedStakeCampaigns
    if (token.address) {
      setFilterToken(token as Token)
    }
  }, [])

  const handleFilterTokenReset = useCallback(() => {
    setFilterToken(undefined)
  }, [])

  const handleSortBy = useCallback((sortBy: string) => {
    setSortBy(sortBy)
  }, [])

  return (
    <PageWrapper>
      <SwapPoolTabs active="pool" />
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
        <ButtonWithExternalLink
          link={getAccountAnalyticsLink(account || '', chainId)}
          style={{ marginTop: '32px', textTransform: 'uppercase' }}
        >
          {t('pairsList.accountAnalyticsAndAccruedFees')}
        </ButtonWithExternalLink>
      )}
    </PageWrapper>
  )
}
