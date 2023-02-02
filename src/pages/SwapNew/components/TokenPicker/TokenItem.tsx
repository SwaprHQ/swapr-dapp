import styled from 'styled-components'

import { CurrencySymbol } from '../../constants'
import { renderCurrencyLogo } from '../../utils'

type TokenItemProps = {
  currencySymbol: CurrencySymbol
}

export function TokenItem({ currencySymbol }: TokenItemProps) {
  return (
    <Button>
      {currencySymbol} {renderCurrencyLogo(currencySymbol)}
    </Button>
  )
}

const Button = styled.button`
  height: 38px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid #464366;
  padding: 10px 14px;
  line-height: 18px;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #bcb3f0;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -185.11%, rgba(46, 23, 242, 0) 49.63%),
    rgba(57, 51, 88, 0.3);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(12.5px);
  cursor: pointer;
`
