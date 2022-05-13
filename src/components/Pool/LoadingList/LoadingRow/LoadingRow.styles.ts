import styled from 'styled-components'

export const Row = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  border-top: 1px solid ${props => props.theme.bg3};
  padding: 22px;
`
