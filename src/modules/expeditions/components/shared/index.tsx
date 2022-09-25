import { ExternalLink } from 'react-feather'
import { Box } from 'rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  border-radius: 12px;
  background-color: #29253e;
`

export const Card = styled(Box)`
  display: flex;
  padding: 24px;
  flex-wrap: 'nowrap';
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
