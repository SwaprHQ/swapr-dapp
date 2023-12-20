import { useTranslation } from 'react-i18next'

import { MarketPrice, StyledProgressCircle } from './styles'

export const MarketPriceButton = () => {
  const { t } = useTranslation('swap')

  return (
    <MarketPrice>
      {t('limitOrder.marketPrice')}
      <StyledProgressCircle />
    </MarketPrice>
  )
}
