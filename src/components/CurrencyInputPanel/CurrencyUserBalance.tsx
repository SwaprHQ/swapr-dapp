import React from 'react'
import { useTranslation } from 'react-i18next'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { UppercaseHelper } from './CurrencyInputPanel.styles'
import { limitNumberOfDecimalPlaces } from '../../utils/prices'
import { CurrencyUserBalanceProps } from './CurrencyInputPanel.types'

export const CurrencyUserBalance = ({
  hideBalance,
  currency,
  pair,
  balance,
  selectedCurrencyBalance,
  customBalanceText,
  onMax,
}: CurrencyUserBalanceProps) => {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()

  if (account) {
    return (
      <TYPE.body
        onClick={onMax}
        fontWeight="600"
        fontSize="10px"
        lineHeight="13px"
        letterSpacing="0.08em"
        style={{
          display: 'inline',
          marginLeft: 'auto',
          cursor: !hideBalance && !!(currency || pair) && (balance || selectedCurrencyBalance) ? 'pointer' : 'auto',
        }}
      >
        <UppercaseHelper>
          {!hideBalance && !!(currency || pair) && (balance || selectedCurrencyBalance) && (
            <>
              {customBalanceText ?? t('balance')}
              <TYPE.small as="span" fontWeight="600" color="text3" style={{ textDecoration: 'underline' }}>
                {limitNumberOfDecimalPlaces(balance || selectedCurrencyBalance) || '0'}
              </TYPE.small>
            </>
          )}
        </UppercaseHelper>
      </TYPE.body>
    )
  }

  return null
}
