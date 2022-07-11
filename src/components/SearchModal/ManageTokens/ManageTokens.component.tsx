import { Token } from '@swapr/sdk'

import React, { ChangeEvent, RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { Box, Flex } from 'rebass'
import { useTheme } from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { useToken } from '../../../hooks/Tokens'
import { useRemoveUserAddedToken, useUserAddedTokens } from '../../../state/user/hooks'
import { ExternalLink, TYPE } from '../../../theme'
import { getExplorerLink, isAddress } from '../../../utils'
import { ButtonOutlined } from '../../Button/Button'
import Card from '../../Card'
import { CurrencyLogo } from '../../CurrencyLogo'
import Row, { RowBetween, RowFixed } from '../../Row'
import { CurrencyModalView } from '../CurrencySearchModal'
import { ImportRow } from '../ImportRow'
import { PaddedColumn, SearchInput, Separator } from '../shared'
import { Footer, TrashIcon, Wrapper } from './ManageTokens.styles'
import { ManageTokensProps } from './ManageTokens.types'

export const ManageTokens = ({ setModalView, setImportToken }: ManageTokensProps) => {
  const { chainId } = useActiveWeb3React()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens: Token[] = useUserAddedTokens()
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.map(token => {
        return removeToken(chainId, token.address)
      })
    }
  }, [removeToken, userAddedTokens, chainId])

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map(token => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CurrencyLogo currency={token} size={'20px'} />
            <ExternalLink href={getExplorerLink(chainId, token.address, 'address')}>
              <TYPE.main ml={'10px'} fontWeight={600}>
                {token.symbol}
              </TYPE.main>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            <TrashIcon onClick={() => removeToken(chainId, token.address)} />
            <ExternalLink href={getExplorerLink(chainId, token.address, 'address')} />
          </RowFixed>
        </RowBetween>
      ))
    )
  }, [userAddedTokens, chainId, removeToken])

  return (
    <Wrapper>
      <Flex width="100%" height="100%" flexDirection="column">
        <Box>
          <PaddedColumn gap="14px">
            <Row>
              <SearchInput
                type="text"
                id="token-search-input"
                placeholder={'0x0000'}
                value={searchQuery}
                autoComplete="off"
                ref={inputRef as RefObject<HTMLInputElement>}
                onChange={handleInput}
              />
            </Row>
            {searchQuery !== '' && !isAddressSearch && (
              <TYPE.error data-testid="token-manager-error-message" error={true}>
                Enter valid token address
              </TYPE.error>
            )}
            {searchToken && (
              <Card
                backgroundColor={theme.bg2}
                padding="10px 0"
                data-testid={searchToken.symbol?.toLowerCase() + '-token-row'}
              >
                <ImportRow
                  token={searchToken}
                  showImportView={() => setModalView(CurrencyModalView.IMPORT_TOKEN)}
                  setImportToken={setImportToken}
                  style={{ height: 'fit-content' }}
                />
              </Card>
            )}
          </PaddedColumn>
        </Box>
        <Box>
          <Separator />
        </Box>
        <Box flex="1">
          <PaddedColumn gap="lg" style={{ overflow: 'auto', marginBottom: '10px' }}>
            <RowBetween>
              <TYPE.main fontSize="14px">
                {userAddedTokens?.length} custom {userAddedTokens.length === 1 ? 'token' : 'tokens'}
              </TYPE.main>
              {userAddedTokens.length > 0 && (
                <ButtonOutlined style={{ padding: 0, width: 'auto' }} onClick={handleRemoveAll}>
                  Clear all
                </ButtonOutlined>
              )}
            </RowBetween>
            {tokenList}
          </PaddedColumn>
        </Box>
        <Box>
          <Footer>
            <TYPE.darkGray fontSize="14px">Tip: custom tokens are stored locally in your browser</TYPE.darkGray>
          </Footer>
        </Box>
      </Flex>
    </Wrapper>
  )
}
