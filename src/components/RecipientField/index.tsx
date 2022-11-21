import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import useENS from '../../hooks/useENS'
import { TYPE } from '../../theme'
import { SearchInput } from '../SearchModal/shared'

const SearchInputStyled = styled(SearchInput)<{ error: boolean }>`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 500;
  padding: ${({ error }) => error && '15px 19px'};
  && {
    border: ${({ error }) => error && 'solid 1px red'};
  }
`

export interface RecipientFieldProps {
  recipient: string | null
  setRecipient: ActionCreatorWithPayload<
    {
      recipient: string | null
    },
    string
  >
}

export const RecipientField = ({ recipient, setRecipient }: RecipientFieldProps) => {
  console.log('zap recipient', recipient)
  const { t } = useTranslation('swap')
  const dispatch = useDispatch()
  const { address, loading } = useENS(recipient)
  const error = useMemo(
    () => Boolean(recipient && recipient.length > 0 && !loading && !address),
    [address, loading, recipient]
  )

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      dispatch(setRecipient({ recipient: input }))
    },
    [dispatch] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Unset recipient on unmount
  useEffect(() => {
    return () => {
      dispatch(setRecipient({ recipient: null }))
    }
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <TYPE.SubHeader lineHeight={'11px'} color={'purple3'}>
        {t('recipientField.recipient')}
      </TYPE.SubHeader>
      <SearchInputStyled
        data-testid="address-input"
        type="text"
        pattern="^(0x[a-fA-F0-9]{40})$"
        placeholder={t('recipientField.addressOrENS')}
        value={(address || recipient) ?? ''}
        onChange={handleInput}
        error={error}
      />
    </div>
  )
}
