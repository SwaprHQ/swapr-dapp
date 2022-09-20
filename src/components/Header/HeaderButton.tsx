import styled from 'styled-components'

export const HeaderButton = styled.div(
  ({ theme }) => ` 
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: bold;
  font-size: 10px;
  line-height: 11px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${theme.text4};
  background: ${theme.bg1};
`
)
