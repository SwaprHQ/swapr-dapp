import styled from 'styled-components'
import { Text } from 'rebass'

export const ValueWithLabelTitle = styled(Text)`
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
export const ValueWithLabelValue = styled(Text)<{ big: boolean }>`
  color: ${({ theme, big }) => (big ? theme.white : theme.text4)};
`
