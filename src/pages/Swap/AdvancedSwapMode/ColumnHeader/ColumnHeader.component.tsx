import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'

import { AdvancedModeDetails } from '../AdvancedSwapMode.styles'

interface ColumnHeaderProps {
  inputTokenSymbol: string
  outputTokenSymbol: string
  activeCurrencySymbolOption: string
  showPrice: boolean
  showTrades: boolean
}

export const ColumnHeader = ({
  activeCurrencySymbolOption,
  inputTokenSymbol,
  outputTokenSymbol,
  showPrice,
  showTrades,
}: ColumnHeaderProps) => {
  const { t } = useTranslation('swap')
  const amountText = t('advancedTradingView.details.amount')

  const translationAmountInput = `${amountText} ${showTrades ? `(${inputTokenSymbol})` : ''}`

  const translationAmountOutput = `${amountText} ${showTrades ? `(${outputTokenSymbol})` : ''}`

  const translationPrice = `${t('advancedTradingView.details.price')} ${
    showTrades ? `(${activeCurrencySymbolOption})` : ''
  }`

  return (
    <AdvancedModeDetails>
      <Text title={translationAmountInput}>{translationAmountInput}</Text>
      <Text title={translationAmountOutput}>{translationAmountOutput}</Text>
      {showPrice && <Text title={translationPrice}>{translationPrice}</Text>}
      <Text sx={{ textAlign: 'right' }}>{t('advancedTradingView.details.time')}</Text>
    </AdvancedModeDetails>
  )
}
