import { Currency, Token } from '@swapr/sdk'

import {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { useTheme } from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { useSearchInactiveTokenLists } from '../../../hooks/Tokens'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import useToggle from '../../../hooks/useToggle'
import { TYPE } from '../../../theme'
import { isAddress } from '../../../utils'
import { ButtonDark2 } from '../../Button'
import Column, { AutoColumn } from '../../Column'
import Row, { RowBetween } from '../../Row'
import { CommonTokens } from '../CommonTokens'
import { CurrencyList } from '../CurrencyList'
import { CurrencySearchModalContext } from '../CurrencySearchModal/CurrencySearchModal.context'
import { SearchInput, Separator } from '../shared'
import { filterTokens, useSortedTokensByQuery } from '../utils/filtering'
import { useTokenComparator } from '../utils/sorting'
import { CurrencySearchContext } from './CurrencySearch.context'
import { CloseIconStyled, ContentWrapper, Footer } from './CurrencySearch.styles'
import { CurrencySearchProps } from './CurrencySearch.types'

export const CurrencySearch = ({
  isOpen,
  onDismiss,
  showManageView,
  showImportView,
  showCommonBases,
  selectedCurrency,
  onCurrencySelect,
  showNativeCurrency,
  otherSelectedCurrency,
  isOutputPanel,
}: CurrencySearchProps) => {
  const { t } = useTranslation('common')
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()
  const {
    allTokens,
    allTokensOnSecondChain,
    searchToken,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedTokenList,
    showFallbackTokens,
  } = useContext(CurrencySearchContext)
  const { setImportToken } = useContext(CurrencySearchModalContext)

  const tokens = isOutputPanel ? allTokensOnSecondChain : allTokens

  const fixedList = useRef<FixedSizeList>()

  const nativeCurrency = useNativeCurrency()

  const [invertSearchOrder] = useState<boolean>(false)

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(tokens ?? {}), debouncedQuery)
  }, [tokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const filteredSortedTokensWithNativeCurrency: Currency[] = useMemo(() => {
    if (!showNativeCurrency || !nativeCurrency.symbol || !nativeCurrency.name || isOutputPanel)
      return filteredSortedTokens

    if (
      nativeCurrency &&
      new RegExp(debouncedQuery.replace(/\s/g, ''), 'gi').test(`${nativeCurrency.symbol} ${nativeCurrency.name}`)
    ) {
      return [nativeCurrency, ...filteredSortedTokens]
    }

    return filteredSortedTokens
  }, [showNativeCurrency, nativeCurrency, isOutputPanel, filteredSortedTokens, debouncedQuery])

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen, setSearchQuery])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
    <ContentWrapper data-testid="token-picker">
      <AutoColumn style={{ padding: '22px 18.5px 20px 18.5px' }} gap="15px">
        <RowBetween>
          <TYPE.Body fontWeight={500}>Select a token</TYPE.Body>
          <CloseIconStyled data-testid="close-icon" onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t('searchPlaceholder')}
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
      {(filteredSortedTokens?.length > 0 || filteredInactiveTokensWithFallback.length > 0) &&
      fixedList !== undefined ? (
        <CurrencyList
          currencies={filteredSortedTokensWithNativeCurrency}
          otherListTokens={filteredInactiveTokensWithFallback}
          onCurrencySelect={onCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          fixedListRef={fixedList as MutableRefObject<FixedSizeList>}
          showImportView={showImportView}
          setImportToken={setImportToken}
          selectedTokenList={selectedTokenList}
          hideBalance={isOutputPanel}
        />
      ) : (
        <Column style={{ padding: '20px', height: '100%' }}>
          <TYPE.Main color={theme.text3} textAlign="center" mb="20px">
            No results found.
          </TYPE.Main>
        </Column>
      )}
      <Footer>
        <Row justify="center">
          <ButtonDark2 onClick={showManageView} data-testid="manage-token-lists-button">
            Manage token lists
          </ButtonDark2>
        </Row>
      </Footer>
    </ContentWrapper>
  )
}
