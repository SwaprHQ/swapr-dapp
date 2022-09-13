import { Currency, currencyEquals, Token } from '@swapr/sdk'

import { useCallback, useMemo } from 'react'
import { Text } from 'rebass'

import { useActiveWeb3React } from '../../../hooks'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { TYPE } from '../../../theme'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import { Loader } from '../../Loader'
import Row from '../../Row'
import { BaseWrapper } from '../shared'
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

  const sortedTokensWithBalance = useMemo(() => {
    let sortedTokensWithBalance: { currency: Currency; balance?: string }[] = []

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
        // balance: balance?.toSignificant(4),
        balance: mockBalance,
      })
    }

    return sortedTokensWithBalance
  }, [balances, filteredSortedTokensWithNativeCurrency])

  const limitedTokensWithBalance = sortedTokensWithBalance.splice(0, limit)
  const restTokensWithBalanceLength = sortedTokensWithBalance.length

  if (limitedTokensWithBalance.length === 0) {
    return null
  }

  return (
    <AutoColumn gap="15px" data-testid="balance-tokens">
      <Row justifyContent="center">
        <TYPE.Body fontWeight={500} fontSize="11px" lineHeight="13px" letterSpacing="0.06em">
          YOUR BALANCE
        </TYPE.Body>
      </Row>
      <Row justifyContent="center" flexWrap={'wrap'} gap={'8px'}>
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
              {balance ? (
                <Text fontWeight={500} fontSize={16}>
                  {balance}
                </Text>
              ) : (
                <Loader />
              )}
              <Text fontWeight={500} fontSize={16} pl={'4px'}>
                {` ${currency.symbol}`}
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
      </Row>
    </AutoColumn>
  )
}
