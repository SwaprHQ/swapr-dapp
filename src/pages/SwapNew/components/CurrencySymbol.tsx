import { Currency } from '@swapr/sdk'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TEXT_COLOR_PRIMARY } from '../constants'
import { FontFamily } from './styles'

type CurrencySymbolProps = {
  currency?: Currency | null
}

export function CurrencySymbol({ currency }: CurrencySymbolProps) {
  const { t } = useTranslation('swap')

  return (
    <Paragraph>
      {(currency && currency.symbol && currency.symbol.length > 20
        ? currency.symbol.slice(0, 4) +
          '...' +
          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
        : currency?.symbol) || <div data-testid="select-token-button"> {t('currencyView.selectToken')}</div>}
    </Paragraph>
  )
}

const Paragraph = styled.p`
  display: inline-block;
  line-height: 24px;
  font-size: 20px;
  ${FontFamily}
  font-weight: 600;
  text-transform: uppercase;
  color: ${TEXT_COLOR_PRIMARY};
  margin: 0 6px;
`
