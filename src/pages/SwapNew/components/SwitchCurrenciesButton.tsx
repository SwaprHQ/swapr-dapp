import styled from 'styled-components'

import { ReactComponent as DownArrowSVG } from '../../../assets/swapbox/swap-arrow.svg'

export function SwitchCurrenciesButton() {
  return (
    <StyledButton>
      <DownArrowSVG />
    </StyledButton>
  )
}

const StyledButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 84px;
  transform: translateX(-50%);
  background: #06060a;
  border-radius: 12px;
  border: 1px solid #0c0c14;
  box-shadow: 0px 0px 42px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(11px);
`
