import styled from 'styled-components'
import { Flex } from 'rebass'

export const Row = styled(Flex)`
  row-gap: 24px;
  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
  }
`
