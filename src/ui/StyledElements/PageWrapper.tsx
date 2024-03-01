import styled from 'styled-components'

export const PageWrapper = styled.div<{ my?: string }>`
  max-width: 856px;
  width: 100%;
  margin: ${({ my = '0' }) => `${my} auto`};
  padding: 0 24px;
`
