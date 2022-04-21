import React, { useCallback, useContext, useState } from 'react'
import { Text } from 'rebass'
import { useDispatch } from 'react-redux'

import ListLogo from '../../ListLogo'
import { AutoColumn } from '../../Column'
import { GoBackIcon } from '../GoBackIcon'
import { ButtonError } from '../../Button'
import { PaddedColumn } from '../shared'
import { CurrencyModalView } from '../CurrencySearchModal'
import { RowBetween, RowFixed } from '../../Row'
import { TYPE, CloseIcon, ExternalLink } from '../../../theme'
import { BottomSectionContainer, Wrapper } from './ImportList.styles'

import { AppDispatch } from '../../../state'
import { useAllLists } from '../../../state/lists/hooks'
import { useActiveWeb3React } from '../../../hooks'
import { useFetchListCallback } from '../../../hooks/useFetchListCallback'
import { enableList, removeList } from '../../../state/lists/actions'

import { ImportListProps } from './ImportList.types'
import { CurrencySearchModalContext } from '../CurrencySearchModal/CurrencySearchModal.context'

export function ImportList({ onBack, onDismiss }: ImportListProps) {
  const { listURL: listURI, importList: list, setModalView } = useContext(CurrencySearchModalContext)
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  const lists = useAllLists()
  const fetchList = useFetchListCallback()

  // monitor is list is loading
  const adding = listURI && Boolean(lists[listURI]?.loadingRequestId)
  const [addError, setAddError] = useState<string>('')

  const handleAddList = useCallback(() => {
    if (adding || !listURI) return
    setAddError('')
    fetchList(listURI)
      .then(() => {
        dispatch(enableList(listURI))
        setModalView(CurrencyModalView.MANAGE)
      })
      .catch(error => {
        setAddError(error.message)
        dispatch(removeList(listURI))
      })
  }, [adding, dispatch, fetchList, listURI, setModalView])

  return (
    <Wrapper>
      <PaddedColumn gap="14px" style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          <GoBackIcon onClick={onBack} />
          <Text fontWeight={500} fontSize={16}>
            Import unknown list
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <AutoColumn>
        <AutoColumn gap="16px" style={{ padding: '20px', paddingTop: '12px' }}>
          <TYPE.body fontSize="14px" fontWeight="400" lineHeight="22px" letterSpacing="-0.02em" color="text4">
            Anyone can create an ERC20 token list on Ethereum, including creating fake versions of existing tokens lists
            and lists that claim to represent projects that do not have an actual list.
          </TYPE.body>
          <TYPE.body fontSize="14px" fontWeight="400" lineHeight="22px" letterSpacing="-0.02em" color="text4">
            This interface can load arbitrary lists by URL. Please take extra caution and do your research when
            interacting with arbitrary token lists.
          </TYPE.body>
          <TYPE.body fontSize="14px" fontWeight="400" lineHeight="22px" letterSpacing="-0.02em" color="text4">
            If you purchase a token from this list, <strong>you may be unable to sell it back.</strong>
          </TYPE.body>
        </AutoColumn>
        <BottomSectionContainer>
          <AutoColumn gap="16px">
            <AutoColumn gap="6px" justify="flex-start">
              <RowFixed>
                {list?.logoURI && <ListLogo defaultText="List" logoURI={list.logoURI} size={'16px'} />}
                <TYPE.main fontSize="16px" lineHeight="20px" ml="8px">
                  {list?.name}
                </TYPE.main>
              </RowFixed>
              {chainId && (
                <ExternalLink
                  color="purple4"
                  style={{ fontWeight: 400 }}
                  href={`https://tokenlists.org/token-list?url=${listURI}`}
                >
                  <TYPE.main color="purple4" fontSize="14px" lineHeight="17px">
                    View on token lists explorer
                  </TYPE.main>
                </ExternalLink>
              )}
            </AutoColumn>
            <ButtonError error onClick={handleAddList}>
              Import
            </ButtonError>
            {addError && (
              <TYPE.error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
                {addError}
              </TYPE.error>
            )}
          </AutoColumn>
        </BottomSectionContainer>
      </AutoColumn>
    </Wrapper>
  )
}
