import { Currency, Token } from '@swapr/sdk'
import React, { KeyboardEvent, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { useSearchInactiveTokenLists } from '../../../hooks/Tokens'
import { TYPE } from '../../../theme'
import { isAddress } from '../../../utils'
import Column, { AutoColumn } from '../../Column'
import Row, { RowBetween } from '../../Row'
import { CommonTokens } from '../CommonTokens'
import { CurrencyList } from '../CurrencyList'
import { filterTokens, useSortedTokensByQuery } from '../utils/filtering'
import { useTokenComparator } from '../utils/sorting'
import { SearchInput, Separator } from '../shared'
import { ThemeContext } from 'styled-components/macro'
import useToggle from '../../../hooks/useToggle'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useActiveWeb3React } from '../../../hooks'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { ButtonDark2 } from '../../Button'
import { CurrencySearchProps } from './CurrencySearch.types'
import { CloseIconStyled, ContentWrapper, Footer } from './CurrencySearch.styles'
import { CurrencySearchContext } from './CurrencySearch.context'
import { CurrencySearchModalContext } from '../CurrencySearchModal/CurrencySearchModal.context'

export const CurrencySearch = ({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  showNativeCurrency
}: CurrencySearchProps) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    allTokens,
    searchToken,
    selectedTokenList,
    showFallbackTokens
  } = useContext(CurrencySearchContext)
  const { setImportToken } = useContext(CurrencySearchModalContext)

  const fixedList = useRef<FixedSizeList>()

  const nativeCurrency = useNativeCurrency()

  const [invertSearchOrder] = useState<boolean>(false)

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery)
  }, [allTokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const filteredSortedTokensWithNativeCurrency: Currency[] = useMemo(() => {
    if (!showNativeCurrency) return filteredSortedTokens
    const s = debouncedQuery.toLowerCase().trim()
    if (nativeCurrency.symbol && nativeCurrency.symbol.toLowerCase().startsWith(s)) {
      return nativeCurrency ? [nativeCurrency, ...filteredSortedTokens] : filteredSortedTokens
    }
    return filteredSortedTokens
  }, [showNativeCurrency, filteredSortedTokens, debouncedQuery, nativeCurrency])

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen, setSearchQuery])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(
    event => {
      const input = event.target.value
      const checksummedInput = isAddress(input)
      setSearchQuery(checksummedInput || input)
      fixedList.current?.scrollTo(0)
    },
    [setSearchQuery]
  )

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === nativeCurrency.symbol) {
          onCurrencySelect(nativeCurrency)
        } else if (filteredSortedTokensWithNativeCurrency.length > 0) {
          if (
            filteredSortedTokensWithNativeCurrency[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithNativeCurrency.length === 1
          ) {
            onCurrencySelect(filteredSortedTokensWithNativeCurrency[0])
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokensWithNativeCurrency, onCurrencySelect, nativeCurrency]
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch) ? debouncedQuery : undefined
  )
  const filteredInactiveTokensWithFallback = useMemo(() => {
    if (filteredTokens.length > 0) return []
    if (showFallbackTokens && filteredInactiveTokens.length > 0) return filteredInactiveTokens
    if (searchToken) return [searchToken]
    return []
  }, [filteredInactiveTokens, filteredTokens.length, searchToken, showFallbackTokens])

  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  return (
    <ContentWrapper>
      <AutoColumn style={{ padding: '22px 18.5px 20px 18.5px' }} gap="15px">
        <RowBetween>
          <TYPE.body fontWeight={500}>Select a token</TYPE.body>
          <CloseIconStyled onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t('Search a name or paste address')}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
            fontWeight={500}
          />
        </Row>
        {showCommonBases && (
          <CommonTokens chainId={chainId} onCurrencySelect={onCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
      </AutoColumn>
      <Separator />
      {filteredSortedTokens?.length > 0 || filteredInactiveTokensWithFallback.length > 0 ? (
        <CurrencyList
          currencies={filteredSortedTokensWithNativeCurrency}
          otherListTokens={filteredInactiveTokensWithFallback}
          onCurrencySelect={onCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          fixedListRef={fixedList}
          showImportView={showImportView}
          setImportToken={setImportToken}
          selectedTokenList={selectedTokenList}
        />
      ) : (
        <Column style={{ padding: '20px', height: '100%' }}>
          <TYPE.main color={theme.text3} textAlign="center" mb="20px">
            No results found.
          </TYPE.main>
        </Column>
      )}
      <Footer>
        <Row justify="center">
          <ButtonDark2 onClick={showManageView}>Manage token lists</ButtonDark2>
        </Row>
      </Footer>
    </ContentWrapper>
  )
}
