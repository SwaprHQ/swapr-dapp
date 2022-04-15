import React, { useContext } from 'react'
import { AutoRow, RowFixed } from '../../Row'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import { TYPE } from '../../../theme'
import ListLogo from '../../ListLogo'
import { ButtonPrimary } from '../../Button'
import { ThemeContext } from 'styled-components/macro'
import { useIsUserAddedToken, useIsTokenActive } from '../../../hooks/Tokens'
import { WrappedTokenInfo } from '../../../state/lists/wrapped-token-info'
import { CheckIcon, NameOverflow, TokenSection } from './ImportRow.styles'
import { ImportRowProps } from './ImportRow.types'

export const ImportRow = ({ token, style, dim, showImportView, setImportToken }: ImportRowProps) => {
  const theme = useContext(ThemeContext)

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token)
  const isActive = useIsTokenActive(token)

  const list = token instanceof WrappedTokenInfo ? token.list : undefined

  return (
    <TokenSection style={style}>
      <CurrencyLogo currency={token} size={'24px'} style={{ opacity: dim ? '0.6' : '1' }} />

      <AutoColumn gap="4px" style={{ opacity: dim ? '0.6' : '1' }}>
        <AutoRow>
          <TYPE.body fontWeight={500}>{token.symbol}</TYPE.body>
          <TYPE.darkGray ml="8px" fontWeight={300}>
            <NameOverflow title={token.name}>{token.name}</NameOverflow>
          </TYPE.darkGray>
        </AutoRow>
        {list && list.logoURI && (
          <RowFixed>
            <TYPE.small mr="4px" color={theme.text3}>
              via {list.name}
            </TYPE.small>
            <ListLogo logoURI={list.logoURI} defaultText={list.name} size="12px" />
          </RowFixed>
        )}
      </AutoColumn>
      {!isActive && !isAdded ? (
        <ButtonPrimary
          width="fit-content"
          padding="6px 12px"
          fontWeight={500}
          fontSize="14px"
          onClick={() => {
            setImportToken && setImportToken(token)
            showImportView()
          }}
        >
          Import
        </ButtonPrimary>
      ) : (
        <RowFixed style={{ minWidth: 'fit-content' }}>
          <CheckIcon />
          <TYPE.main color={theme.green1}>Active</TYPE.main>
        </RowFixed>
      )}
    </TokenSection>
  )
}
