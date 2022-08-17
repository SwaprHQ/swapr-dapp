import { useTranslation } from 'react-i18next'

import { CurrencyLogo } from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { StyledDropDown, StyledTokenName } from './PairSelectPanel.styles'
import { PairViewProps } from './PairSelectPanel.types'

export const PairView = ({
  pair,
  currency,
  chainIdOverride,
  currencyWrapperSource,
  disablePairSelect,
}: PairViewProps) => {
  const { t } = useTranslation('swap')

  if (pair) {
    return (
      <>
        <DoubleCurrencyLogo marginRight={4} currency0={pair.token0} currency1={pair.token1} size={20} />
        <StyledTokenName className="pair-name-container">
          {pair?.token0.symbol}/{pair?.token1.symbol}
        </StyledTokenName>
        {!disablePairSelect && (pair || currency) && <StyledDropDown selected={!!currency} />}
      </>
    )
  }

  // TODO remove
  return (
    <>
      {currency && (
        <CurrencyLogo
          size="20px"
          currency={currency}
          chainIdOverride={chainIdOverride}
          currencyWrapperSource={currencyWrapperSource}
        />
      )}
      <StyledTokenName
        className="token-symbol-container"
        data-testid="token-symbol"
        active={Boolean(currency && currency.symbol)}
      >
        {(currency && currency.symbol && currency.symbol.length > 20
          ? currency.symbol.slice(0, 4) +
            '...' +
            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
          : currency?.symbol) || <div data-testid="select-token-button"> {t('button.selectPair')}</div>}
      </StyledTokenName>
      {!disablePairSelect && (pair || currency) && <StyledDropDown selected={!!currency} />}
    </>
  )
}
