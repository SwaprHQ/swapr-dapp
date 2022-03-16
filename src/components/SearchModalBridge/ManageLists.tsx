import React, { useCallback, useMemo, useContext } from 'react'

import { Separator } from './styleds'
import ListToggle from '../Toggle/ListToggle'
import { UNSUPPORTED_LIST_URLS } from '../../constants/lists'
import { useActiveWeb3React } from '../../hooks'
import { useActiveListsHandlers, useBridgeSupportedLists } from '../../services/Omnibridge/hooks/Omnibrige.hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import Column, { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import ListLogo from '../ListLogo'
import Row, { RowFixed } from '../Row'

const Wrapper = styled(Column)`
  width: 100%;
  height: 100%;
`

const StyledTitleText = styled.div<{ active: boolean }>`
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.white : theme.text2)};
`

const StyledListUrlText = styled(TYPE.main)<{ active: boolean }>`
  font-size: 12px;
  color: ${({ theme, active }) => (active ? theme.white : theme.text2)};
`

const RowWrapper = styled(Row)<{ bgColor: string; active: boolean }>`
  background-color: ${({ bgColor, active, theme }) => (active ? bgColor ?? 'transparent' : theme.bg2)};
  transition: background-color 0.2s ease;
  align-items: center;
  padding: 16px;
  border-radius: 20px;
`

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

function ListRow({ listUrl }: { listUrl: string }) {
  const { chainId } = useActiveWeb3React()
  const listsByUrl = useBridgeSupportedLists()
  const { activateList, deactivateList, isListActive } = useActiveListsHandlers()
  const list = listsByUrl[listUrl]
  const tokensAmountInCurrentChain = useMemo(() => {
    if (!list || list.tokens.length === 0 || !chainId) return 0
    return list.tokens.filter(token => token.chainId === chainId).length
  }, [chainId, list])

  const theme = useContext(ThemeContext)
  const isActive = isListActive(listUrl)

  const handleEnableList = useCallback(() => activateList(listUrl), [activateList, listUrl])
  const handleDisableList = useCallback(() => deactivateList(listUrl), [deactivateList, listUrl])

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

const ListContainer = styled.div`
  padding: 1rem;
  height: 100%;
  overflow: auto;
  padding-bottom: 80px;
`

export function ManageLists() {
  const lists = useBridgeSupportedLists()

  const renderableLists = useMemo(() => {
    return Object.keys(lists).filter(listUrl => {
      // only show loaded lists, hide unsupported lists
      return Boolean(lists[listUrl]) && !Boolean(UNSUPPORTED_LIST_URLS.includes(listUrl))
    })
  }, [lists])

  return (
    <Wrapper>
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
