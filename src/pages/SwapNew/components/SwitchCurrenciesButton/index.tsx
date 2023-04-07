import styled, { keyframes } from 'styled-components'

import { ReactComponent as TwoArrowsSVG } from '../../../../assets/images/swap-icon.svg'
import { ReactComponent as DownArrowSVG } from '../../../../assets/swapbox/swap-arrow.svg'
import {
  SWITCH_CURRENCIES_BUTTON_BACKGROUND_COLOR,
  SWITCH_CURRENCIES_BUTTON_BORDER,
  SWITCH_CURRENCIES_BUTTON_BOX_SHADOW,
} from '../../constants'

type SwitchCurrenciesButtonProps = {
  loading: boolean
  onClick: () => void
}

export function SwitchCurrenciesButton({ loading, onClick }: SwitchCurrenciesButtonProps) {
  return <StyledButton onClick={onClick}>{loading ? <RotatingArrows /> : <DownArrowSVG />}</StyledButton>
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
  z-index: 1;
  transform: translateX(-50%);
  background: ${SWITCH_CURRENCIES_BUTTON_BACKGROUND_COLOR};
  border-radius: 12px;
  border: ${SWITCH_CURRENCIES_BUTTON_BORDER};
  box-shadow: ${SWITCH_CURRENCIES_BUTTON_BOX_SHADOW};
  backdrop-filter: blur(11px);
  cursor: pointer;
`

const Rotation = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const RotatingArrows = styled(TwoArrowsSVG)`
  animation: ${Rotation} 2s linear infinite;
`
