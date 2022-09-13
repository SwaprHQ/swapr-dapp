import { Currency, currencyEquals, Token } from '@swapr/sdk'

import { useCallback } from 'react'
import { Text } from 'rebass'

import { useActiveWeb3React } from '../../../hooks'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { TYPE } from '../../../theme'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import { AutoRow } from '../../Row'
import { BaseWrapper } from './BalanceTokens.styles'
import { BalanceTokensProps } from './BalanceTokens.types'

export const BalanceTokens = ({
  onCurrencySelect,
  selectedCurrency,
  filteredSortedTokensWithNativeCurrency,
  limit = 5,
}: BalanceTokensProps) => {
  const nativeCurrency = useNativeCurrency()
  const { account } = useActiveWeb3React()
  const balances = useCurrencyBalances(account || undefined, filteredSortedTokensWithNativeCurrency)
  const handleClick = useCallback(() => {
    if (!selectedCurrency || !currencyEquals(selectedCurrency, nativeCurrency)) {
      onCurrencySelect(nativeCurrency)
    }
  }, [nativeCurrency, onCurrencySelect, selectedCurrency])

  let sortedTokensWithBalance: { currency: Currency; balance: string }[] = []

  for (const [index, balance] of balances.entries()) {
    let mockBalance
    if (balance?.equalTo(BigInt(0))) {
      // -- Mock --
      if (index < 6) {
        mockBalance = '100'
      } else {
        break
      }
      // -- End of Mock --
      // break
    }
    sortedTokensWithBalance.push({
      currency: filteredSortedTokensWithNativeCurrency[index],
      // balance: balance?.toSignificant(4) || '0',
      balance: mockBalance || '0',
    })
  }

  const limitedTokensWithBalance = sortedTokensWithBalance.splice(0, limit)
  const restTokensWithBalanceLength = sortedTokensWithBalance.length

  if (limitedTokensWithBalance.length === 0) {
    return null
  }

  return (
    <AutoColumn gap="15px" data-testid="balance-tokens">
      <AutoRow justifyContent="center">
        <TYPE.Body fontWeight={500} fontSize="11px" lineHeight="13px" letterSpacing="0.06em">
          YOUR BALANCE
        </TYPE.Body>
      </AutoRow>
      <AutoRow gap="4px" justifyContent="center">
        {limitedTokensWithBalance.map(({ balance, currency }, index) => {
          const selected = selectedCurrency instanceof Token && selectedCurrency.address === currency.address
          const selectedNativeCurrency = selectedCurrency === nativeCurrency || selectedCurrency === undefined

          return (
            <BaseWrapper
              onClick={() =>
                index ? !selected && onCurrencySelect(currency) : !selectedNativeCurrency && onCurrencySelect(currency)
              }
              disabled={index ? selected : selectedNativeCurrency}
              key={currency.address}
            >
              <CurrencyLogo size="20px" currency={currency} marginRight={8} />
              <Text fontWeight={500} fontSize={16}>
                {`${balance} ${currency.symbol}`}
              </Text>
            </BaseWrapper>
          )
        })}
        {restTokensWithBalanceLength > 0 && (
          <BaseWrapper onClick={() => console.log('elo')}>
            <Text fontWeight={500} fontSize={16}>
              {`+${restTokensWithBalanceLength}`}
            </Text>
          </BaseWrapper>
        )}
      </AutoRow>
    </AutoColumn>
  )
}
