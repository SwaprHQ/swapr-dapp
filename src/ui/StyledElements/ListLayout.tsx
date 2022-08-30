import styled from 'styled-components'

export const ListLayout = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-gap: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px 16px;
  `};
`
