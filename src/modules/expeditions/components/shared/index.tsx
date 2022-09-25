import { ExternalLink } from 'react-feather'
import { Box } from 'rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1And2};
`

export const Card = styled(Box)`
  display: flex;
  flex-flow: column nowrap;
  padding: 24px;
  gap: 16px;
`

export const StyledExternalLink = styled(ExternalLink)`
  font-size: 13px;
  font-style: italic;
  text-decoration: underline;

  &:hover {
    color: white;
  }
`
