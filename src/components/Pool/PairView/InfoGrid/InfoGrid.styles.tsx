import styled from 'styled-components'

export const InfoGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-wrap: wrap;
  gap: 24px;
`}
`
