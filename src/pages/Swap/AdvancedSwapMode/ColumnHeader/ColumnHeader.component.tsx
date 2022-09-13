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
  return (
    <AdvancedModeDetails>
      <Text>
        {t('details.amount')} {showTrades ? `(${inputTokenSymbol})` : ''}
      </Text>
      <Text>
        {t('details.amount')} {showTrades ? `(${outputTokenSymbol})` : ''}
      </Text>
      {showPrice && (
        <Text>
          {t('details.price')} {showTrades ? `(${activeCurrencySymbolOption})` : ''}
        </Text>
      )}
      <Text sx={{ textAlign: 'right' }}>{t('details.time')}</Text>
    </AdvancedModeDetails>
  )
}
