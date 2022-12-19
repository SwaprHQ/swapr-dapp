import styled from 'styled-components'

import { NumberBadge } from '../../../../components/NumberBadge'
import Row from '../../../../components/Row'

export const TabRow = styled(Row)`
  display: inline-flex;
  width: auto;
  margin: 0 0 10px;
  padding: 2px;
  background: ${({ theme }) => theme.bg1And2};
  border-radius: 12px;
`

export const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 32px;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: ${({ theme }) => theme.bg1};
  }

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`
export const Badge = styled(NumberBadge)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 6px;
  font-size: 9px;
  letter-spacing: 0;
`
