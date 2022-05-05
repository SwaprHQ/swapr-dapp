import { Text } from 'rebass'
import styled from 'styled-components'

export const ListLayout = styled.div`
  display: grid;
  grid-template-columns: auto;
`

export const Header = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  padding: 12px 28px;
`

export const HeaderText = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.purple3};
  text-transform: uppercase;
`
