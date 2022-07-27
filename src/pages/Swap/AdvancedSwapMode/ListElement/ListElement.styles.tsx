import styled from 'styled-components'

export const Root = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid #191919;
  }
  padding: 0.5rem;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
  align-items: center;
`

export const Cell = styled.div`
  width: calc(100% / 3);
  text-align: center;
`
