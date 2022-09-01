import { useTheme } from 'styled-components'

import { useIsTokenActive, useIsUserAddedToken } from '../../../hooks/Tokens'
import { WrappedTokenInfo } from '../../../state/lists/wrapped-token-info'
import { TYPE } from '../../../theme'
import { ButtonPrimary } from '../../Button'
import { AutoColumn } from '../../Column'
import { CurrencyLogo } from '../../CurrencyLogo'
import ListLogo from '../../ListLogo'
import { AutoRow, RowFixed } from '../../Row'
import { CheckIcon, NameOverflow, TokenSection } from './ImportRow.styles'
import { ImportRowProps } from './ImportRow.types'

export const ImportRow = ({ token, style, dim, showImportView, setImportToken }: ImportRowProps) => {
  const theme = useTheme()

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token)
  const isActive = useIsTokenActive(token)

  const list = token instanceof WrappedTokenInfo ? token.list : undefined

  return (
    <TokenSection style={style}>
      <CurrencyLogo currency={token} size={'24px'} style={{ opacity: dim ? '0.6' : '1' }} />

      <AutoColumn gap="4px" style={{ opacity: dim ? '0.6' : '1' }}>
        <AutoRow>
          <TYPE.Body fontWeight={500}>{token.symbol}</TYPE.Body>
          <TYPE.DarkGray ml="8px" fontWeight={300}>
            <NameOverflow title={token.name}>{token.name}</NameOverflow>
          </TYPE.DarkGray>
        </AutoRow>
        {list && list.logoURI && (
          <RowFixed>
            <TYPE.Small mr="4px" color={theme.text3}>
              via {list.name}
            </TYPE.Small>
            <ListLogo logoURI={list.logoURI} defaultText={list.name} size="12px" />
          </RowFixed>
        )}
      </AutoColumn>
      {!isActive && !isAdded ? (
        <ButtonPrimary
          width="fit-content"
          padding="6px 12px"
          data-testid="import-button"
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
          <TYPE.Main color={theme.green1}>Active</TYPE.Main>
        </RowFixed>
      )}
    </TokenSection>
  )
}
