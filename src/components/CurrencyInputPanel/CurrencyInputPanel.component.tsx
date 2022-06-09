import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { normalizeInputValue } from '../../utils'
import { CurrencyWrapperSource } from '../CurrencyLogo'
import { FiatValueDetails } from '../FiatValueDetails'
import { NumericalInput } from '../Input/NumericalInput'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import { CurrencySearchModalComponent } from '../SearchModal/CurrencySearchModal'
import {
  Aligner,
  Container,
  Content,
  CurrencySelect,
  FiatRow,
  InputPanel,
  InputRow,
  LabelRow,
  UppercaseHelper,
} from './CurrencyInputPanel.styles'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'
import { CurrencyUserBalance } from './CurrencyUserBalance'
import { CurrencyView } from './CurrencyView'

export const CurrencyInputPanelComponent = ({
  id,
  pair = null, // used for double token logo
  onMax,
  value,
  label,
  balance,
  currency,
  disabled,
  hideInput = false,
  isLoading = false,
  fiatValue,
  hideBalance = false,
  priceImpact,
  onUserInput,
  otherCurrency,
  chainIdOverride,
  showCommonBases,
  onCurrencySelect,
  customBalanceText,
  isFallbackFiatValue,
  currencyWrapperSource = CurrencyWrapperSource.SWAP,
  disableCurrencySelect = false,
}: CurrencyInputPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const onDismiss = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setFocused(false)
  }, [])

  const handleCurrencySelectClick = useCallback(() => {
    if (!isLoading && !disableCurrencySelect) {
      setIsOpen(true)
    }
  }, [disableCurrencySelect, isLoading])

  const debouncedUserInput = useMemo(() => {
    return debounce(onUserInput, 250)
  }, [onUserInput])

  useEffect(() => {
    if (localValue !== value) {
      setLocalValue(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <InputPanel id={id}>
      <Container focused={focused}>
        <Content>
          {!hideInput && label && (
            <LabelRow>
              <RowBetween>
                <TYPE.body fontWeight="600" fontSize="11px" lineHeight="13px" letterSpacing="0.08em">
                  <UppercaseHelper>{label}</UppercaseHelper>
                </TYPE.body>
              </RowBetween>
            </LabelRow>
          )}
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={localValue}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onUserInput={value => {
                    setLocalValue(normalizeInputValue(value))
                    debouncedUserInput(normalizeInputValue(value))
                  }}
                  disabled={disabled}
                  data-testid={'transaction-value-input'}
                />
              </>
            )}
            <CurrencySelect
              selected={!!(currency || pair)}
              className="open-currency-select-button"
              disableCurrencySelect={disableCurrencySelect}
              onClick={handleCurrencySelectClick}
              disabled={(isLoading || disableCurrencySelect) && !currency}
            >
              <Aligner>
                {isLoading ? (
                  <Loader style={{ width: '97.25px' }} />
                ) : (
                  <CurrencyView
                    pair={pair}
                    currency={currency}
                    chainIdOverride={chainIdOverride}
                    currencyWrapperSource={currencyWrapperSource}
                  />
                )}
              </Aligner>
            </CurrencySelect>
          </InputRow>
          <FiatRow>
            <RowBetween>
              <FiatValueDetails fiatValue={fiatValue} priceImpact={priceImpact} isFallback={isFallbackFiatValue} />
              <CurrencyUserBalance
                hideBalance={hideBalance}
                currency={currency}
                pair={pair}
                balance={balance}
                selectedCurrencyBalance={selectedCurrencyBalance}
                customBalanceText={customBalanceText}
                onMax={onMax}
              />
            </RowBetween>
          </FiatRow>
        </Content>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModalComponent
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={new Array(1).fill(otherCurrency)}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
