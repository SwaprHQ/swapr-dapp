import { Flex } from 'rebass'
import styled from 'styled-components'

export const Row = styled(Flex)`
  row-gap: 24px;
  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`
