import styled from 'styled-components'

import { ReactComponent as CowSVG } from '../../../assets/swapbox/dex-logo-cow.svg'
import { FontFamily } from './styles'

export function SwapButton() {
  return (
    <StyledButton>
      <SwapButtonLabel>Swap With</SwapButtonLabel>
      <CowSVG />
      <SwapButtonLabel>Cow</SwapButtonLabel>
    </StyledButton>
  )
}

const StyledButton = styled.button`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(93.39deg, #2b00a4 -8.9%, #d67b5a 114.08%);
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`

const SwapButtonLabel = styled.p`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
`
