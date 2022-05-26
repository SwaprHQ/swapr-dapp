import { FixedSizeList } from 'react-window'
import styled from 'styled-components'
import { Text } from 'rebass'

export const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

export const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

export const TokenListLogoWrapper = styled.img`
  height: 20px;
`

export const StyledFixedSizeList = styled(FixedSizeList)`
  &&::-webkit-scrollbar {
    width: 10px;
  }

  &&::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.bg3};
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.bg2};
  }
  //firefox support
  scrollbar-color: ${({ theme }) => theme.bg3 + ' ' + theme.bg2};
  scrollbar-width: thin;
`
