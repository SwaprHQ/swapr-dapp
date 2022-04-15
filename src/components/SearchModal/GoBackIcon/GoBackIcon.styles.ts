import { ChevronLeft } from 'react-feather'
import styled from 'styled-components'

export const StyledGoBackIcon = styled(ChevronLeft)`
  color: ${({ theme }) => theme.purple3};
  width: 16px;
  height: 16px;
  cursor: pointer;
`
