import { Currency } from '@swapr/sdk'

import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { useAutoMaxBalance } from '../../../../hooks/useAutoMaxBalance'
import { CurrencySymbol } from '../../constants'
import { CommonTokens } from './CommonTokens'
import { SearchTokenItem } from './SearchTokenItem'

type TokenPickerProps = {
  onMax?: () => void
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
  isMaxAmount: boolean
  closeTokenPicker: () => void
}

export function TokenPicker({ onMax, onCurrencySelect, isMaxAmount, closeTokenPicker }: TokenPickerProps) {
  const [tokenPickerContainer] = useState(() => document.createElement('div'))
  const [tokenPickerInputValue, setTokenPickerInputValue] = useState('')

  useEffect(() => {
    tokenPickerContainer.classList.add('token-picker-root')
    document.body.appendChild(tokenPickerContainer)

    return () => {
      document.body.removeChild(tokenPickerContainer)
    }
  }, [tokenPickerContainer])

  const { handleOnCurrencySelect } = useAutoMaxBalance({
    onMax,
    onCurrencySelect,
  })

  const onCurrencySelectWithoutDismiss = useCallback(
    (currency: Currency) => {
      if (handleOnCurrencySelect && currency) handleOnCurrencySelect(currency, isMaxAmount)
    },
    [isMaxAmount, handleOnCurrencySelect]
  )

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelectWithoutDismiss(currency)
      closeTokenPicker()
    },
    [closeTokenPicker, onCurrencySelectWithoutDismiss]
  )

  const onClose = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.stopPropagation()
      closeTokenPicker()
    }
  }

  return createPortal(
    <Container
      onClick={onClose}
      initial={{ opacity: 0, scale: 2 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.2,
        },
      }}
      exit={{
        opacity: 0,
        scale: 2,
        transition: {
          duration: 0.1,
        },
      }}
    >
      <Input
        value={tokenPickerInputValue}
        onChange={e => setTokenPickerInputValue(e.target.value)}
        placeholder="Search token by name or paste address"
        spellCheck={false}
      />
      {!tokenPickerInputValue.trim() ? (
        <>
          {/* <YourBalance onCurrencySelect={() => console.log('TODO!')} /> */}
          <CommonTokens onCurrencySelect={handleCurrencySelect} />
        </>
      ) : (
        <SearchList>
          <SearchTokenItem currencySymbol={CurrencySymbol.ETH} balance={0.4342} />
          <SearchTokenItem currencySymbol={CurrencySymbol.SWPR} balance={1214.15} />
          <SearchTokenItem currencySymbol={CurrencySymbol.DXD} balance={55532.1245} />
        </SearchList>
      )}
    </Container>,
    tokenPickerContainer
  )
}

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(7px);
`

const Input = styled.input`
  width: 478px;
  height: 48px;
  box-sizing: border-box;
  background: rgba(20, 18, 31, 0.5);
  border-radius: 12px;
  border: 2px solid #8c83c0;
  outline: none;
  line-height: 14px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 500;
  color: #dddaf8;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.15);
  padding: 15px 20px;
  backdrop-filter: blur(12.5px);
  margin: 220px auto 74px;
`

const TokensSection = styled.div`
  width: 478px;
  text-align: center;
  margin-bottom: 34px;
`

const SearchList = styled.div`
  max-width: 478px;
  width: 100%;
`

const CCC = styled.div`
  margin-bottom: 16px;
`

const SearchTokenInfo = styled.div`
  height: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`

const SearchTokenCurrencyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const SearchTokenCurrencySymbol = styled.p`
  display: inline-block;
`

const SearchTokenCurrencyBalance = styled.p`
  display: inline-block;
  line-height: 18px;
  font-size: 15px;
  font-family: Inter;
  font-weight: 500;
  text-align: right;
  text-transform: uppercase;
  font-feature-settings: 'zero' on;
  color: #bcb3f0;
`

const SearchTokenName = styled.p`
  line-height: 12px;
  font-size: 10px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  color: #dddaf8;
  opacity: 0.8;
`
