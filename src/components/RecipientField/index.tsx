import React, { useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { SearchInput } from '../SearchModal/shared'
import { TYPE } from '../../theme'
import useENS from '../../hooks/useENS'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

const SearchInputStyled = styled(SearchInput)<{ error: boolean }>`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 500;
  padding: ${({ error }) => error && '15px 19px'};
  && {
    border: ${({ error }) => error && 'solid 1px red'};
  }
`

export interface RecipientField {
  recipient: string | null
  action: any
}

export const RecipientField = ({ recipient, action }: RecipientField) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { address, loading } = useENS(recipient)
  const error = useMemo(() => Boolean(recipient && recipient.length > 0 && !loading && !address), [
    address,
    loading,
    recipient,
  ])

  const handleInput = useCallback(
    event => {
      const input = event.target.value
      dispatch(action({ recipient: input }))
    },
    [action, dispatch]
  )

  // Unset recipient on unmount
  useEffect(() => {
    return () => {
      dispatch(action({ recipient: null }))
    }
  }, [action, dispatch])

  return (
    <div>
      <TYPE.subHeader lineHeight={'11px'} color={'purple3'}>
        {t('recipient')}
      </TYPE.subHeader>
      <SearchInputStyled
        data-testid="address-input"
        type="text"
        placeholder={t('addressOrENS')}
        value={(address || recipient) ?? ''}
        onChange={handleInput}
        error={error}
      />
    </div>
  )
}
