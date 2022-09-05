import { Text } from 'rebass'
import styled from 'styled-components'

export const TableHeaderText = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.purple3};
  text-transform: uppercase;
`
