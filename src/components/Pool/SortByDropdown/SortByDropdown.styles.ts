import { Flex, Text } from 'rebass/styled-components'
import styled from 'styled-components'

export const List = styled.ul`
  margin: 0;
  padding: 0;
`

export const ListItem = styled.li`
  cursor: pointer;
  & + & {
    margin-top: 28px;
  }
`

export const StyledText = styled(Text)`
  text-transform: uppercase;
`

export const StyledFlex = styled(Flex)`
  cursor: pointer;
  gap: 4px;
`
