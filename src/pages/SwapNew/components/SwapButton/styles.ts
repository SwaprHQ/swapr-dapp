import styled from 'styled-components'

import { getSwapButtonActiveColor, getSwapButtonHoverColor, TEXT_COLOR_PRIMARY } from '../../constants'
import { FontFamily } from '../styles'

const COW_SWAP_COLOR = 'linear-gradient(93.39deg, #2b00a4 -8.9%, #d67b5a 114.08%)'

export const StyledButton = styled.button`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: ${COW_SWAP_COLOR};
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    background: ${getSwapButtonHoverColor(COW_SWAP_COLOR)};
  }

  &:active {
    background: ${getSwapButtonActiveColor(COW_SWAP_COLOR)};
  }

  &:disabled {
    background: rgba(60, 56, 100, 0.1);
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
