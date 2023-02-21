import styled from 'styled-components'

import { TEXT_COLOR_SECONDARY } from '../constants'
import { FontFamily } from './styles'

export function CurrencyBalance() {
  return (
    <Paragraph>
      Balance: <span>$4000</span>
    </Paragraph>
  )
}

const Paragraph = styled.p`
  width: fit-content;
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${TEXT_COLOR_SECONDARY};

  & span {
    text-decoration: underline;
  }
`
