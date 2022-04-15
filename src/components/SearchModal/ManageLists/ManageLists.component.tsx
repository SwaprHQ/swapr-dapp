import { usePopper } from 'react-popper'
import { TokenList } from '@uniswap/token-lists'
import { Settings, CheckCircle } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeContext } from 'styled-components/macro'
import React, { useCallback, useMemo, useRef, useState, useEffect, useContext } from 'react'

import useToggle from '../../../hooks/useToggle'
import { useActiveWeb3React } from '../../../hooks'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useFetchListCallback } from '../../../hooks/useFetchListCallback'
import { useIsListActive, useAllLists } from '../../../state/lists/hooks'

import Card from '../../Card'
import ListLogo from '../../ListLogo'
import ListToggle from '../../Toggle/ListToggle'
import Column, { AutoColumn } from '../../Column'
import Row, { RowFixed, RowBetween } from '../../Row'
import { ButtonEmpty, ButtonPrimary } from '../../Button'
import { CurrencyModalView } from '../CurrencySearchModal'
import { PaddedColumn, SearchInput, Separator, SeparatorDark } from '../shared'
import {
  Wrapper,
  RowWrapper,
  StyledMenu,
  ListContainer,
  StyledTitleText,
  PopoverContainer,
  StyledListUrlText,
  UnpaddedLinkStyledButton
} from './ManageLists.styles'

import uriToHttp from '../../../utils/uriToHttp'
import { AppDispatch, AppState } from '../../../state'
import { ExternalLink, TYPE, IconWrapper } from '../../../theme'
import { parseENSAddress } from '../../../utils/parseENSAddress'
import { acceptListUpdate, removeList, disableList, enableList } from '../../../state/lists/actions'

import { UNSUPPORTED_LIST_URLS } from '../../../constants/lists'

import { ManageListsProps } from './ManageLists.types'

const listUrlRowHTMLId = (listUrl: string) => {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

const ListRow = ({ listUrl }: { listUrl: string }) => {
  const { chainId } = useActiveWeb3React()
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const dispatch = useDispatch<AppDispatch>()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]
  const tokensAmountInCurrentChain = useMemo(() => {
    if (!list || list.tokens.length === 0 || !chainId) return 0
    return list.tokens.filter(token => token.chainId === chainId).length
  }, [chainId, list])

  const theme = useContext(ThemeContext)
  const isActive = useIsListActive(listUrl)

  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement>()

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [8, 8] } }]
  })

  useOnClickOutside(node, open ? toggle : undefined)

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return
    dispatch(acceptListUpdate(listUrl))
  }, [dispatch, listUrl, pending])

  const handleRemoveList = useCallback(() => {
    if (window.prompt(`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      dispatch(removeList(listUrl))
    }
  }, [dispatch, listUrl])

  const handleEnableList = useCallback(() => {
    dispatch(enableList(listUrl))
  }, [dispatch, listUrl])

  const handleDisableList = useCallback(() => {
    dispatch(disableList(listUrl))
  }, [dispatch, listUrl])

  if (!list || tokensAmountInCurrentChain === 0) return null
  return (
    <RowWrapper active={isActive} bgColor={theme.primary1} key={listUrl} id={listUrlRowHTMLId(listUrl)}>
      <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURI={list.logoURI || ''} defaultText={list.name} />
      <Column style={{ flex: '1' }}>
        <Row>
          <StyledTitleText active={isActive}>{list.name}</StyledTitleText>
        </Row>
        <RowFixed mt="4px">
          <StyledListUrlText active={isActive} mr="6px">
            {tokensAmountInCurrentChain} tokens
          </StyledListUrlText>
          <StyledMenu ref={node as any}>
            <ButtonEmpty onClick={toggle} ref={setReferenceElement} padding="0">
              <Settings stroke={theme.text1} size={12} />
            </ButtonEmpty>
            <PopoverContainer show={open} ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
              <div>{list && `v${list.version.major}.${list.version.minor}.${list.version.patch}`}</div>
              <SeparatorDark />
              <ExternalLink href={`https://tokenlists.org/token-list?url=${listUrl}`}>View list</ExternalLink>
              <UnpaddedLinkStyledButton onClick={handleRemoveList} disabled={Object.keys(listsByUrl).length === 1}>
                Remove list
              </UnpaddedLinkStyledButton>
              {pending && (
                <UnpaddedLinkStyledButton onClick={handleAcceptListUpdate}>Update list</UnpaddedLinkStyledButton>
              )}
            </PopoverContainer>
          </StyledMenu>
        </RowFixed>
      </Column>
      <ListToggle
        isActive={isActive}
        bgColor={theme.primary1}
        toggle={() => {
          isActive ? handleDisableList() : handleEnableList()
        }}
      />
    </RowWrapper>
  )
}

export const ManageLists = ({ setModalView, setImportList, setListUrl }: ManageListsProps) => {
  const theme = useContext(ThemeContext)

  const [listUrlInput, setListUrlInput] = useState<string>('')

  const lists = useAllLists()

  const handleInput = useCallback(e => {
    setListUrlInput(e.target.value)
  }, [])

  const fetchList = useFetchListCallback()

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput))
  }, [listUrlInput])

  // temporary fetched list for import flow
  const [tempList, setTempList] = useState<TokenList>()
  const [addError, setAddError] = useState<string | undefined>()

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then(list => setTempList(list))
        .catch(() => setAddError('Error importing list'))
    }
    // if valid url, fetch details for card
    if (validUrl) {
      fetchTempList()
    } else {
      setTempList(undefined)
      listUrlInput !== '' && setAddError('Enter valid list location')
    }

    // reset error
    if (listUrlInput === '') {
      setAddError(undefined)
    }
  }, [fetchList, listUrlInput, validUrl])

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput)

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList) return
    setImportList(tempList)
    setModalView(CurrencyModalView.IMPORT_LIST)
    setListUrl(listUrlInput)
  }, [listUrlInput, setImportList, setListUrl, setModalView, tempList])

  const renderableLists = useMemo(() => {
    return Object.keys(lists).filter(listUrl => {
      // only show loaded lists, hide unsupported lists
      return Boolean(lists[listUrl].current) && !Boolean(UNSUPPORTED_LIST_URLS.includes(listUrl))
    })
  }, [lists])

  return (
    <Wrapper>
      <PaddedColumn gap="14px">
        <Row>
          <SearchInput
            type="text"
            id="list-add-input"
            placeholder="https:// or ipfs:// or ENS name"
            value={listUrlInput}
            onChange={handleInput}
          />
        </Row>
        {addError ? (
          <TYPE.error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
            {addError}
          </TYPE.error>
        ) : null}
      </PaddedColumn>
      {tempList && (
        <PaddedColumn style={{ paddingTop: 0 }}>
          <Card backgroundColor={theme.bg1And2} padding="12px 20px">
            <RowBetween>
              <RowFixed>
                {tempList.logoURI && <ListLogo logoURI={tempList.logoURI} defaultText={tempList.name} size="40px" />}
                <AutoColumn gap="4px" style={{ marginLeft: '20px' }}>
                  <TYPE.body fontWeight={600}>{tempList.name}</TYPE.body>
                  <TYPE.main fontSize={'12px'}>{tempList.tokens.length} tokens</TYPE.main>
                </AutoColumn>
              </RowFixed>
              {isImported ? (
                <RowFixed>
                  <IconWrapper stroke={theme.text2} size="16px" marginRight={'10px'}>
                    <CheckCircle />
                  </IconWrapper>
                  <TYPE.body color={theme.text2}>Loaded</TYPE.body>
                </RowFixed>
              ) : (
                <ButtonPrimary
                  style={{ fontSize: '14px' }}
                  padding="6px 8px"
                  width="fit-content"
                  onClick={handleImport}
                >
                  Import
                </ButtonPrimary>
              )}
            </RowBetween>
          </Card>
        </PaddedColumn>
      )}
      <Separator />
      <ListContainer>
        <AutoColumn gap="md">
          {renderableLists.map(listUrl => (
            <ListRow key={listUrl} listUrl={listUrl} />
          ))}
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}
