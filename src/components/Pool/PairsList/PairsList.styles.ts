import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { UndecoratedLink } from '../../UndercoratedLink'

export const HeaderText = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.purple3};
  text-transform: uppercase;
`

export const Header = styled(Flex)`
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
`

export const ListLayout = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-gap: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px 16px;
  `};
`

export const PaginationRow = styled(Flex)`
  width: 100%;
  justify-content: flex-end;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
  `};

  & ul {
    margin: 22px 0;
  }
`

export const StyledUndecoratedLink = styled(UndecoratedLink)`
  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`
