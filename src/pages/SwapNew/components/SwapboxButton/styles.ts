import styled from 'styled-components'

import {
  getSwapButtonActiveColor,
  getSwapButtonHoverColor,
  getSwapboxButtonBackgroundColor,
  TEXT_COLOR_PRIMARY,
  ELEMENTS_BACKGROUND_PRIMARY,
} from '../../constants'
import { FontFamily } from '../../constants'

export const StyledButton = styled.button<{ platformName?: string }>`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: ${({ platformName }) => getSwapboxButtonBackgroundColor(platformName)};
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    background: ${({ platformName }) => getSwapButtonHoverColor(getSwapboxButtonBackgroundColor(platformName))};
  }

  &:active {
    background: ${({ platformName }) => getSwapButtonActiveColor(getSwapboxButtonBackgroundColor(platformName))};
  }

  &:disabled {
    background: ${ELEMENTS_BACKGROUND_PRIMARY};
    cursor: default;
  }
`

export const SwapButtonLabel = styled.p<{ light?: boolean }>`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ light }) => (light ? '#8e89c6' : TEXT_COLOR_PRIMARY)};
`

export const PlatformLogo = styled.img`
  width: 21px;
  height: 21px;
`
