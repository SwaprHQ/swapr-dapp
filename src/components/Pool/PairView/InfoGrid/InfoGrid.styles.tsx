import styled from 'styled-components'

export const InfoGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
`}
`
