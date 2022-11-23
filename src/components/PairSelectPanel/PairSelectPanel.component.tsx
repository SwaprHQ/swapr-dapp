import { Currency, Pair } from '@swapr/sdk'

import debounce from 'lodash/debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { normalizeInputValue } from '../../utils'
import { CurrencyUserBalance } from '../CurrencyInputPanel/CurrencyUserBalance'
import { CurrencyWrapperSource } from '../CurrencyLogo'
import { FiatValueDetails } from '../FiatValueDetails'
import { NumericalInput } from '../Input/NumericalInput'
import { Loader } from '../Loader'
import { RowBetween } from '../Row'
import { PairSearchModal } from '../SearchModal/PairSearchModal'
import {
  Aligner,
  Container,
  Content,
  InputPanel,
  InputRow,
  LabelRow,
  PairSelect,
  UppercaseHelper,
} from './PairSelectPanel.styles'
import { PairSelectPanelProps } from './PairSelectPanel.types'
import { PairView } from './PairView'

export const PairSelectPanelComponent = ({
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
  maxAmount,
  currencyWrapperSource = CurrencyWrapperSource.SWAP,
  disablePairSelect = false,
  onPairSelect,
  filterPairs,
}: PairSelectPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const { account } = useActiveWeb3React()
  const [isMaxAmount, setIsMaxAmount] = useState(false)
  const [pairZap, setPairZap] = useState<Pair>()

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
    if (!isLoading && !disablePairSelect) {
      setIsOpen(true)
    }
  }, [disablePairSelect, isLoading])

  const handleOnCurrencySelect = useCallback(
    (currency: Currency) => {
      if (onCurrencySelect && currency) onCurrencySelect(currency, isMaxAmount)
    },
    [isMaxAmount, onCurrencySelect]
  )

  const handleOnUserInput = useCallback(
    (value: string) => {
      if (maxAmount?.toExact() === value) setIsMaxAmount(true)
      else setIsMaxAmount(false)

      onUserInput(value)
    },
    [maxAmount, onUserInput]
  )

  const handleOnPairSelect = useCallback((pair: Pair) => {
    setPairZap(pair)
  }, [])

  const handleOnMax = useCallback(() => {
    if (onMax) {
      onMax()
      setIsMaxAmount(true)
    }
  }, [onMax])

  const debouncedUserInput = useMemo(() => {
    return debounce(handleOnUserInput, 250)
  }, [handleOnUserInput])

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
                <TYPE.Body fontWeight="600" fontSize="11px" lineHeight="13px" letterSpacing="0.08em">
                  <UppercaseHelper>{label}</UppercaseHelper>
                </TYPE.Body>
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
            <PairSelect
              selected={!!(currency || pair)}
              className="open-currency-select-button"
              disablePairSelect={disablePairSelect}
              onClick={handleCurrencySelectClick}
              disabled={(isLoading || disablePairSelect) && !currency}
            >
              <Aligner>
                {isLoading ? (
                  <Loader style={{ width: '97.25px' }} />
                ) : (
                  <PairView
                    pair={pair}
                    currency={currency}
                    chainIdOverride={chainIdOverride}
                    currencyWrapperSource={currencyWrapperSource}
                  />
                )}
              </Aligner>
            </PairSelect>
          </InputRow>
          <div>
            <RowBetween>
              <FiatValueDetails fiatValue={fiatValue} priceImpact={priceImpact} isFallback={isFallbackFiatValue} />
              <CurrencyUserBalance
                hideBalance={hideBalance}
                currency={currency}
                pair={pair}
                balance={balance}
                selectedCurrencyBalance={selectedCurrencyBalance}
                customBalanceText={customBalanceText}
                onMax={handleOnMax}
              />
            </RowBetween>
          </div>
        </Content>
      </Container>
      {!disablePairSelect && onPairSelect && (
        <PairSearchModal isOpen={isOpen} onDismiss={onDismiss} onPairSelect={onPairSelect} filterPairs={filterPairs} />
      )}
    </InputPanel>
  )
}
