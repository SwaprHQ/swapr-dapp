import styled from 'styled-components'

export const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(2, 1fr);
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: auto;
  `};
  grid-gap: 12px 10px;
`
