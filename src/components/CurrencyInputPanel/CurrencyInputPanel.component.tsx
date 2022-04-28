import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Content,
  FiatRow,
  Aligner,
  InputRow,
  LabelRow,
  Container,
  InputPanel,
  CurrencySelect,
  StyledDropDown,
  StyledTokenName,
  UppercaseHelper
} from './CurrencyInputPanel.styles'
import Loader from '../Loader'
import { TYPE } from '../../theme'
import { RowBetween } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import NumericalInput from '../Input/NumericalInput'
import { FiatValueDetails } from '../FiatValueDetails'
import { CurrencyLogo, CurrencyWrapperSource } from '../CurrencyLogo'
import { CurrencySearchModalComponent } from '../SearchModal/CurrencySearchModal'

import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { limitNumberDecimalPlaces } from '../../utils/prices'

import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

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
  currencyWrapperSource = CurrencyWrapperSource.SWAP,
  disableCurrencySelect = false
}: CurrencyInputPanelProps) => {
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const onDismiss = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setFocused(false)
  }, [])

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
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onUserInput={onUserInput}
                  disabled={disabled}
                  data-testid={'transaction-value-input'}
                />
              </>
            )}
            <CurrencySelect
              selected={!!(currency || pair)}
              className="open-currency-select-button"
              disableCurrencySelect={disableCurrencySelect}
              onClick={() => {
                if (!isLoading && !disableCurrencySelect) {
                  setIsOpen(true)
                }
              }}
              disabled={(isLoading || disableCurrencySelect) && !currency}
            >
              <Aligner>
                {isLoading ? (
                  <Loader style={{ width: '97.25px' }} />
                ) : (
                  <>
                    {pair ? (
                      <DoubleCurrencyLogo marginRight={4} currency0={pair.token0} currency1={pair.token1} size={20} />
                    ) : currency ? (
                      <CurrencyLogo
                        size="20px"
                        currency={currency}
                        chainIdOverride={chainIdOverride}
                        currencyWrapperSource={currencyWrapperSource}
                      />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}/{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || <div data-testid="select-token-button"> {t('select Token')}</div>}
                      </StyledTokenName>
                    )}
                    {!disableCurrencySelect && (pair || currency) && <StyledDropDown selected={!!currency} />}
                  </>
                )}
              </Aligner>
            </CurrencySelect>
          </InputRow>
          <FiatRow>
            <RowBetween>
              {fiatValue && (
                <FiatValueDetails
                  fiatValue={fiatValue?.toFixed(2, { groupSeparator: ',' })}
                  priceImpact={priceImpact}
                />
              )}
              {account && (
                <TYPE.body
                  onClick={onMax}
                  fontWeight="600"
                  fontSize="10px"
                  lineHeight="13px"
                  letterSpacing="0.08em"
                  style={{
                    display: 'inline',
                    marginLeft: 'auto',
                    cursor:
                      !hideBalance && !!(currency || pair) && (balance || selectedCurrencyBalance) ? 'pointer' : 'auto'
                  }}
                >
                  <UppercaseHelper>
                    {!hideBalance && !!(currency || pair) && (balance || selectedCurrencyBalance) && (
                      <>
                        {customBalanceText ?? t('balance')}
                        <TYPE.small as="span" fontWeight="600" color="text3" style={{ textDecoration: 'underline' }}>
                          {limitNumberDecimalPlaces(balance || selectedCurrencyBalance)}
                        </TYPE.small>
                      </>
                    )}
                  </UppercaseHelper>
                </TYPE.body>
              )}
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
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
