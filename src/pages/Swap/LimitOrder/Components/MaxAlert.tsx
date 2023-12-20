import styled from 'styled-components'

export const MaxAlert = styled.div`
  background-color: ${({ theme }) => theme.orange1};
  display: flex;
  font-size: 13px;
  padding: 10px;
  margin: 10px 0px;
  color: ${({ theme }) => theme.purpleBase};
  border-radius: 5px;
  justify-content: center;
`
