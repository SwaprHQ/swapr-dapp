import { CurrencyAmount, CurveTrade, RoutablePlatform, Trade, TradeType, UniswapV2Trade } from '@swapr/sdk'
import React, { FC, useCallback } from 'react'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import CurrencyLogo from '../CurrencyLogo'
import { Box, Flex } from 'rebass'
import Radio from '../Radio'
import QuestionHelper from '../QuestionHelper'
import WarningHelper from '../WarningHelper'
import SwapRoute from './SwapRoute'
import { useSwapsGasEstimations } from '../../hooks/useSwapsGasEstimate'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { useSwapState } from '../../state/swap/hooks'
import { useGasFeesUSD } from '../../hooks/useGasFeesUSD'
import { RowFixed } from '../Row'
import { ROUTABLE_PLATFORM_LOGO } from '../../constants'
import styled from 'styled-components'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { Field } from '../../state/swap/actions'
import Skeleton from 'react-loading-skeleton'
import useDebounce from '../../hooks/useDebounce'

export interface SwapPlatformSelectorProps {
  allPlatformTrades: (Trade | undefined)[] | undefined
  selectedTrade?: Trade
  onSelectedPlatformChange: (newPlatform: RoutablePlatform) => void
  isLoading: boolean
}

interface GasFeeProps {
  loading: boolean
  gasFeeUSD: CurrencyAmount | null
}

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

interface PlatformSelectorLoaderProps {
  showGasFeeColumn?: boolean
}

const PlatformList = styled.div`
  display: flex;
  flex-direction: column;
`

const ListContentItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  & > *:nth-child(1) {
    flex-basis: 40%;
  }
  & > *:nth-child(2),
  & > *:nth-child(2) {
    flex-basis: 25%;
  }
  & > *:last-child {
    flex-basis: 80px;
    display: flex;
    justify-content: flex-end;
  }
`

export const ListHeader = styled(ListContentItem)`
  font-weight: bold;
  padding: 0 9px;
  font-weight: 600;
  line-height: 12px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: ${props => props.theme.purple3};
  &:first-child,
  &:last-child {
    padding: 0;
  }
`

export const PlatformSelectorLoader: FC<PlatformSelectorLoaderProps> = ({ showGasFeeColumn }) => (
  <>
    {[0, 1, 2].map(i => (
      <ListContentItem>
        <Skeleton width="72px" height="12px" />
        <Skeleton width="36px" height="12px" />
        {showGasFeeColumn && <Skeleton width="36px" height="12px" />}
        <Skeleton width="36px" height="12px" />
      </ListContentItem>
    ))}
  </>
)
export function SwapPlatformSelector({
  isLoading,
  allPlatformTrades,
  selectedTrade,
  onSelectedPlatformChange
}: SwapPlatformSelectorProps) {
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

  const showGasFeeColumn = estimations.length === allPlatformTrades?.length

  const handleSelectedTradeOverride = useCallback(
    event => {
      const newTrade = allPlatformTrades?.find(trade => trade?.platform.name.toLowerCase() === event.target.value)
      if (!newTrade) return
      onSelectedPlatformChange(newTrade.platform)
    },
    [allPlatformTrades, onSelectedPlatformChange]
  )

  return (
    <AutoColumn gap="18px" style={{ borderBottom: '1px solid #292643', paddingBottom: '12px', marginBottom: '12px' }}>
      <PlatformList>
        <ListHeader>
          <div>EXCHANGE</div>
          <div>FEE</div>
          {showGasFeeColumn && <div>GAS</div>}
          <div>{`${independentField === Field.OUTPUT ? 'MAX SENT' : 'MIN. RECEIVED'}`}</div>
        </ListHeader>
        {isLoading && allPlatformTrades?.length === 0 ? (
          <PlatformSelectorLoader showGasFeeColumn={showGasFeeColumn} />
        ) : (
          allPlatformTrades?.map((trade, i) => {
            if (!trade) return null // some platforms might not be compatible with the currently selected network
            const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
            const gasFeeUSD = gasFeesUSD[i]

            let realizedLPFee
            if (trade instanceof CurveTrade) {
              realizedLPFee = trade.fee
            } else {
              realizedLPFee = computeTradePriceBreakdown(trade).realizedLPFee
            }

            const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)
            return (
              <ListContentItem key={i} style={{ lineHeight: '22px' }}>
                <div>
                  <Radio
                    checked={selectedTrade?.platform.name === trade.platform.name}
                    label={trade.platform.name}
                    icon={ROUTABLE_PLATFORM_LOGO[trade.platform.name]}
                    value={trade.platform.name.toLowerCase()}
                    onChange={handleSelectedTradeOverride}
                  />
                </div>
                <div>
                  <TYPE.main color="text4">{realizedLPFee ? `${realizedLPFee.toFixed(2)}%` : '-'}</TYPE.main>
                </div>
                <div>{showGasFeeColumn && <GasFee loading={debouncedLoadingGasFees} gasFeeUSD={gasFeeUSD} />}</div>
                <div>
                  <RowFixed>
                    <TYPE.subHeader color="white" fontSize="12px" fontWeight="600">
                      {isExactIn
                        ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)}` ?? '-'
                        : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)}` ?? '-'}
                    </TYPE.subHeader>
                    <CurrencyLogo
                      currency={isExactIn ? trade.outputAmount.currency : trade.inputAmount.currency}
                      size="14px"
                      marginLeft={4}
                    />
                  </RowFixed>
                </div>
              </ListContentItem>
            )
          })
        )}
      </PlatformList>

      {selectedTrade && selectedTrade instanceof UniswapV2Trade && selectedTrade.route.path.length > 2 && (
        <Flex mx="2px" width="100%">
          <Flex>
            <Box>
              <TYPE.body fontSize="12px" lineHeight="15px" fontWeight="500" minWidth="auto">
                Route
              </TYPE.body>
            </Box>
            <Box>
              <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
            </Box>
          </Flex>
          <Box flex="1">
            <SwapRoute trade={selectedTrade} />
          </Box>
        </Flex>
      )}
    </AutoColumn>
  )
}
