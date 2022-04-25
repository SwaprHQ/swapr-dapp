import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pair } from '@swapr/sdk'
import { FixedSizeList } from 'react-window'
import { useTranslation } from 'react-i18next'

import Column from '../../Column'
import { Wrapper } from './PairSearch.styles'
import { PairList } from '../PairList'
import { RowBetween } from '../../Row'
import { SortButton } from '../SortButton'
import { CloseIcon, TYPE } from '../../../theme'
import { PaddedColumn, SearchInput, Separator } from '../shared'

import { isAddress } from '../../../utils'
import { useAllPairs } from '../../../hooks/useAllPairs'
import { usePairAtAddress } from '../../../data/Reserves'
import { usePairsComparator } from '../utils/sorting'
import { filterPairs as filterPairsBySearchQuery } from '../utils/filtering'

import { PairSearchProps } from './PairSearch.types'

export const PairSearch = ({ selectedPair, onPairSelect, onDismiss, isOpen, filterPairs }: PairSearchProps) => {
  const { t } = useTranslation()

  const fixedList = useRef<FixedSizeList>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)
  const { pairs: allPairs } = useAllPairs()

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchPair = usePairAtAddress(searchQuery)

  const pairsComparator = usePairsComparator(invertSearchOrder)

  const filteredPairs: Pair[] = useMemo(() => {
    let pairs = allPairs
    if (filterPairs) pairs = allPairs.filter(filterPairs)
    if (isAddressSearch) return searchPair ? [searchPair] : []
    return filterPairsBySearchQuery(pairs, searchQuery)
  }, [allPairs, filterPairs, isAddressSearch, searchPair, searchQuery])

  const filteredSortedPairs: Pair[] = useMemo(() => {
    if (searchPair) return [searchPair]
    return filteredPairs.sort(pairsComparator)
  }, [filteredPairs, searchPair, pairsComparator])

  const handlePairSelect = useCallback(
    (pair: Pair) => {
      onPairSelect(pair)
      onDismiss()
    },
    [onDismiss, onPairSelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === 'Enter' &&
        filteredSortedPairs.length > 0 &&
        (((filteredSortedPairs[0].token0.symbol || '') + (filteredSortedPairs[0].token1.symbol || '')).toLowerCase() ===
          searchQuery.trim().toLowerCase() ||
          filteredSortedPairs.length === 1)
      ) {
        handlePairSelect(filteredSortedPairs[0])
      }
    },
    [filteredSortedPairs, handlePairSelect, searchQuery]
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  return (
    <Wrapper data-testid="select-a-pair">
      <Column style={{ width: '100%', height: '100%', flex: '1 1' }}>
        <PaddedColumn gap="16px">
          <RowBetween>
            <TYPE.body fontWeight={500} fontSize={16}>
              Select a pair
            </TYPE.body>
            <CloseIcon onClick={onDismiss} data-testid="close-search-pair" />
          </RowBetween>
          <SearchInput
            data-testid="search-pair"
            type="text"
            placeholder={t('pairSearchPlaceholder')}
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
          <RowBetween>
            <TYPE.body fontSize="11px" lineHeight="13px" letterSpacing="0.06em">
              NAME
            </TYPE.body>
            <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
          </RowBetween>
        </PaddedColumn>
        <Separator />
        <PairList pairs={filteredSortedPairs} onPairSelect={handlePairSelect} selectedPair={selectedPair} />
      </Column>
    </Wrapper>
  )
}
