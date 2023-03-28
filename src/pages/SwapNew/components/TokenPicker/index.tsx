import { Currency, Token } from '@swapr/sdk'

import { motion } from 'framer-motion'
import { useCallback, ChangeEvent } from 'react'
import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { filterTokens, useSortedTokensByQuery } from '../../../../components/SearchModal/utils/filtering'
import { useTokenComparator } from '../../../../components/SearchModal/utils/sorting'
import { useAllTokens, useToken } from '../../../../hooks/Tokens'
import { useAutoMaxBalance } from '../../../../hooks/useAutoMaxBalance'
import useDebounce from '../../../../hooks/useDebounce'
import { useNativeCurrency } from '../../../../hooks/useNativeCurrency'
import { useCombinedActiveList } from '../../../../state/lists/hooks'
import { isAddress } from '../../../../utils'
import { CloseButton } from './CloseButton'
import { CommonTokens } from './CommonTokens'
import { SearchList } from './SearchList'

type TokenPickerProps = {
  onMax?: () => void
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
  isMaxAmount: boolean
  closeTokenPicker: () => void
  showNativeCurrency?: boolean
  currencyOmitList?: string[]
}

export function TokenPicker({
  onMax,
  onCurrencySelect,
  isMaxAmount,
  closeTokenPicker,
  showNativeCurrency,
  currencyOmitList,
}: TokenPickerProps) {
  const [tokenPickerContainer] = useState(() => document.createElement('div'))
  const [tokenPickerInputValue, setTokenPickerInputValue] = useState('')
  const [invertSearchOrder] = useState<boolean>(false)

  const debouncedQuery = useDebounce(tokenPickerInputValue, 200)
  const searchToken = useToken(debouncedQuery)
  const allTokens = useAllTokens()
  const selectedTokenList = useCombinedActiveList()
  const showFallbackTokens = true

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

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens ?? {}), debouncedQuery)
  }, [allTokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const nativeCurrency = useNativeCurrency()

  const filteredSortedTokensWithNativeCurrency: Currency[] = useMemo(() => {
    let filteredTokensList = filteredSortedTokens
    if ((currencyOmitList?.length ?? 0) > 0) {
      filteredTokensList = filteredSortedTokens.filter(({ address }) =>
        currencyOmitList?.some(addr => addr.toUpperCase() !== address.toUpperCase())
      )
    }

    if (!showNativeCurrency || !nativeCurrency.symbol || !nativeCurrency.name) return filteredTokensList

    if (
      nativeCurrency &&
      new RegExp(debouncedQuery.replace(/\s/g, ''), 'gi').test(`${nativeCurrency.symbol} ${nativeCurrency.name}`)
    ) {
      const tokensWithoutNativeCurrency = filteredTokensList.filter(token => token.address !== nativeCurrency.address)
      return [nativeCurrency, ...tokensWithoutNativeCurrency]
    }
    return filteredTokensList
  }, [filteredSortedTokens, currencyOmitList, showNativeCurrency, nativeCurrency, debouncedQuery])

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

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      const checksummedInput = isAddress(input)

      setTokenPickerInputValue(checksummedInput || input)
    },
    [setTokenPickerInputValue]
  )

  const onClose = (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
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
        onChange={handleInput}
        placeholder="Search token by name or paste address"
        spellCheck={false}
      />
      {!tokenPickerInputValue.trim() ? (
        <CommonTokens onCurrencySelect={handleCurrencySelect} />
      ) : (
        <SearchList
          filteredSortedTokensWithNativeCurrency={filteredSortedTokensWithNativeCurrency}
          handleCurrencySelect={handleCurrencySelect}
        />
      )}
      <CloseButton onClick={onClose} />
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
  max-width: 536px;
  width: 100%;
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
  margin: 220px auto 0;
`
