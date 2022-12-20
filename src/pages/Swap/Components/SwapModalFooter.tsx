import { Trade, TradeType, UniswapV2Trade } from '@swapr/sdk'

import { useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { ButtonError } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import QuestionHelper from '../../../components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../../../components/Row'
import { PRICE_IMPACT_MEDIUM } from '../../../constants'
import { Field } from '../../../state/swap/types'
import { TYPE } from '../../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
} from '../../../utils/prices'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styles'

export default function SwapModalFooter({
  trade,
  onConfirm,
  // allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade), [trade])
  const { priceImpactWithoutFee, realizedLPFeeAmount } = useMemo(
    () => computeTradePriceBreakdown(trade as UniswapV2Trade),
    [trade]
  )
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center" mb="6px">
          <StyledKey>Price</StyledKey>
          <StyledValue
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini style={{ marginLeft: 6 }} onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </StyledValue>
        </RowBetween>

        <RowBetween mb="6px">
          <RowFixed>
            <StyledKey>{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}</StyledKey>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <StyledValue data-testid="estimated-output">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </StyledValue>
            <StyledValue marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </StyledValue>
          </RowFixed>
        </RowBetween>
        <RowBetween mb="6px">
          <RowFixed>
            <StyledKey> Price Impact</StyledKey>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween mb="6px">
          <RowFixed>
            <StyledKey> Liquidity provider fee</StyledKey>
            <QuestionHelper text="A portion of each trade goes to liquidity providers as incentive." />
          </RowFixed>
          <StyledValue>
            {realizedLPFeeAmount
              ? `${realizedLPFeeAmount?.toSignificant(6)} ${trade.inputAmount.currency.symbol}`
              : '-'}
          </StyledValue>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > PRICE_IMPACT_MEDIUM}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          {' '}
          <Text fontSize={13} fontWeight={600}>
            {severity > PRICE_IMPACT_MEDIUM ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </ButtonError>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}

export const StyledKey = styled(TYPE.Body)`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.text5};
`
export const StyledValue = styled(TYPE.Body)<{ color?: string }>`
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme, color }) => (color ? color : theme.text5)};
`
