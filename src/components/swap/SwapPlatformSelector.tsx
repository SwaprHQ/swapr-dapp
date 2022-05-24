import React, { useCallback, useContext, useEffect, useState } from 'react'
import { CurrencyAmount, Percent, Trade, RoutablePlatform, TradeType, UniswapV2Trade } from '@swapr/sdk'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import { CurrencyLogo } from '../CurrencyLogo'
import { Box, Flex } from 'rebass'
import WarningHelper from '../WarningHelper'
import SwapRoute from './SwapRoute'
import { useSwapsGasEstimations } from '../../hooks/useSwapsGasEstimate'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { useSwapState } from '../../state/swap/hooks'
import { useGasFeesUSD } from '../../hooks/useGasFeesUSD'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  limitNumberOfDecimalPlaces,
  simpleWarningSeverity,
} from '../../utils/prices'
import { Field } from '../../state/swap/actions'
import Skeleton from 'react-loading-skeleton'
import useDebounce from '../../hooks/useDebounce'
import {
  SelectionListDetails,
  SelectionListLabel,
  SelectionListLabelWrapper,
  SelectionListName,
  SelectionListOption,
  SelectionListReceiveAmount,
  SelectionListWindowWrapper,
} from '../SelectionList'
import { ONE_BIPS, PRICE_IMPACT_MEDIUM, ROUTABLE_PLATFORM_LOGO } from '../../constants'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { ChevronsDown } from 'react-feather'

export interface SwapPlatformSelectorProps {
  allPlatformTrades: (Trade | undefined)[] | undefined
  selectedTrade?: Trade
  onSelectedPlatformChange: (newPlatform: RoutablePlatform) => void
}

interface GasFeeProps {
  loading: boolean
  gasFeeUSD: CurrencyAmount | null
}

const StyledFlex = styled(Flex)`
  gap: 4px;
`

const StyledRouteFlex = styled(Flex)`
  align-items: center;
  background-color: rgba(25, 26, 36, 0.55);
  boarder: 1px solid ${({ theme }) => theme.purple6};
  border-radius: 12px;
  padding: 18px 16px;
  margin-bottom: 16px;
`

const MoreMarketsButton = styled(Flex)`
  cursor: pointer;
  text-transform: uppercase;
`

function GasFee({ loading, gasFeeUSD }: GasFeeProps) {
  if (loading) {
    return <Skeleton width="36px" height="12px" />
  }
  if (gasFeeUSD) {
    return (
      <TYPE.main color="text4" fontSize="10px" lineHeight="12px">
        ${gasFeeUSD.toFixed(2)}
      </TYPE.main>
    )
  }
  return <WarningHelper text="Could not estimate gas fee. Please make sure you've approved the traded token." />
}

const PriceImpact = ({ priceImpact }: { priceImpact?: Percent }) => {
  return (
    <TYPE.main
      color={simpleWarningSeverity(priceImpact) >= PRICE_IMPACT_MEDIUM ? 'red1' : 'text4'}
      fontSize="10px"
      lineHeight="12px"
    >
      {priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${priceImpact.toFixed(2)}%`) : '-'}
    </TYPE.main>
  )
}

export function SwapPlatformSelector({
  allPlatformTrades,
  selectedTrade,
  onSelectedPlatformChange,
}: SwapPlatformSelectorProps) {
  const isMobileByMedia = useIsMobileByMedia()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  const [showAllPlatformsTrades, setShowAllPlatformsTrades] = useState(false)
  const [allowedSlippage] = useUserSlippageTolerance()
  const { recipient, independentField } = useSwapState()
  const { loading: loadingTradesGasEstimates, estimations } = useSwapsGasEstimations(
    allowedSlippage,
    recipient,
    allPlatformTrades
  )
  const { loading: loadingGasFeesUSD, gasFeesUSD } = useGasFeesUSD(
    estimations.map(estimation => (estimation && estimation.length > 0 ? estimation[0] : null))
  )
  const loadingGasFees = loadingGasFeesUSD || loadingTradesGasEstimates
  const debouncedLoadingGasFees = useDebounce(loadingGasFees, 2000)

  useEffect(() => {
    setShowAllPlatformsTrades(false)
  }, [allPlatformTrades])

  const showGasFees = estimations.length === allPlatformTrades?.length

  const handleSelectedTradeOverride = useCallback(
    platformName => {
      const newTrade = allPlatformTrades?.find(trade => trade?.platform.name === platformName)
      if (!newTrade) return
      onSelectedPlatformChange(newTrade.platform)
    },
    [allPlatformTrades, onSelectedPlatformChange]
  )

  const displayedPlatformTrade = showAllPlatformsTrades ? allPlatformTrades : allPlatformTrades?.slice(0, 3)

  return (
    <AutoColumn>
      {selectedTrade instanceof UniswapV2Trade && selectedTrade.route.path.length > 2 && (
        <StyledRouteFlex>
          {!isMobileByMedia && (
            <TYPE.body fontSize="14px" lineHeight="15px" fontWeight="400" minWidth="auto" color={theme.purple2}>
              Route
            </TYPE.body>
          )}
          <Box flex="1">
            <SwapRoute trade={selectedTrade} />
          </Box>
        </StyledRouteFlex>
      )}
      <SelectionListWindowWrapper>
        <SelectionListLabelWrapper>
          <SelectionListLabel justify={true} flex={showGasFees ? '30%' : '45%'}>
            {t('exchange')}
          </SelectionListLabel>
          <SelectionListLabel>{isMobileByMedia ? t('pImp') : t('pImpact')}</SelectionListLabel>
          <SelectionListLabel>{t('fee')}</SelectionListLabel>
          {showGasFees && <SelectionListLabel>{t('gas')}</SelectionListLabel>}
          <SelectionListLabel flex="25%">
            {independentField === Field.OUTPUT ? t('maxSent') : t('minReceived')}
          </SelectionListLabel>
        </SelectionListLabelWrapper>

        {displayedPlatformTrade?.map((trade, i) => {
          if (!trade) return null // some platforms might not be compatible with the currently selected network
          const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
          const gasFeeUSD = gasFeesUSD[i]
          const { realizedLPFee, priceImpactWithoutFee } = computeTradePriceBreakdown(trade as UniswapV2Trade)
          const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade)
          const tokenAmount = limitNumberOfDecimalPlaces(
            isExactIn ? slippageAdjustedAmounts[Field.OUTPUT] : slippageAdjustedAmounts[Field.INPUT]
          )

          return (
            <SelectionListOption
              key={trade.platform.name}
              isSelected={selectedTrade?.platform.name === trade.platform.name}
              onClick={() => handleSelectedTradeOverride(trade.platform.name)}
            >
              <SelectionListName
                flex={showGasFees ? '30%' : '45%'}
                isSelected={selectedTrade?.platform.name === trade.platform.name}
              >
                <StyledFlex alignItems="center">
                  {ROUTABLE_PLATFORM_LOGO[trade.platform.name]}
                  {trade.platform.name}
                </StyledFlex>
              </SelectionListName>
              <SelectionListDetails>
                <PriceImpact priceImpact={priceImpactWithoutFee} />
              </SelectionListDetails>
              <SelectionListDetails>{realizedLPFee ? `${realizedLPFee.toFixed(2)}%` : '-'}</SelectionListDetails>
              {showGasFees && (
                <SelectionListDetails>
                  <GasFee loading={debouncedLoadingGasFees} gasFeeUSD={gasFeeUSD} />
                </SelectionListDetails>
              )}
              <SelectionListReceiveAmount flex="25%">
                <TYPE.subHeader color="white" fontSize="12px" fontWeight="600">
                  {tokenAmount === '0' ? '<0.0000001' : tokenAmount || '-'}
                </TYPE.subHeader>
                <CurrencyLogo
                  currency={isExactIn ? trade.outputAmount.currency : trade.inputAmount.currency}
                  size="14px"
                  marginLeft={4}
                />
              </SelectionListReceiveAmount>
            </SelectionListOption>
          )
        })}
      </SelectionListWindowWrapper>
      {allPlatformTrades && allPlatformTrades.length > 3 && (
        <Flex justifyContent="center">
          {!showAllPlatformsTrades && (
            <MoreMarketsButton alignItems="center" onClick={() => setShowAllPlatformsTrades(true)}>
              <TYPE.main fontWeight={600} color={'purple3'} fontSize="10px" mr="8px">
                {t('showMore')}
              </TYPE.main>
              <ChevronsDown size={15} color={theme.purple3} />
            </MoreMarketsButton>
          )}
        </Flex>
      )}
    </AutoColumn>
  )
}
