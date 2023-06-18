import { Currency } from '@swapr/sdk'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReactComponent as ProgressCircle } from '../../../../../assets/images/progress-circle.svg'

import { MarketPrice } from './styles'

const StyledProgressCircle = styled(ProgressCircle)`
  width: 12px;
  height: 12px;
  margin-left: 4px;
  transform: rotate(-90deg);

  .move {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: dash 15s 0s infinite linear forwards;

    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }
  }
`

export const MarketPriceButton = memo(
  ({
    buyTokenAmountCurrency: _,
    sellTokenAmountCurrency: __,
  }: {
    buyTokenAmountCurrency: Currency
    sellTokenAmountCurrency: Currency
  }) => {
    const { t } = useTranslation('swap')

    return (
      <MarketPrice>
        {t('limitOrder.marketPrice')}
        <StyledProgressCircle />
      </MarketPrice>
    )
  }
)
