import styled, { css } from 'styled-components'

export interface AmountProps {
  zero?: boolean
  borderRadius?: string
}

/**
 * Amount
 */
export const Amount = styled.span<AmountProps>`
  padding: 6px 8px;
  margin: 0;
  max-height: 22px;
  font-weight: bold;
  font-size: 10px;
  line-height: 11px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text4};
  background: ${({ theme }) => theme.bg1};
  border-radius: ${props => (props.borderRadius ? props.borderRadius : '12px')};
  white-space: nowrap;
  ${props =>
    props.zero &&
    css`
      color: ${props => props.theme.red1};
      background: rgba(240, 46, 81, 0.2);
    `};
`
