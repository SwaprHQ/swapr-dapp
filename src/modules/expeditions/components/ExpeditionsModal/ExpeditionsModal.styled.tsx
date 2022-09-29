import styled, { keyframes } from 'styled-components'

import { AutoColumn } from '../../../../components/Column'
import { HeaderButton } from '../../../../components/Header/HeaderButton'

export const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
  padding: 32px;
  overflow-y: hidden;
`

const gradientAnimation = keyframes`
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
	100% {background-position: 0% 50%;}
`

export const ExpeditionsLogo = styled(HeaderButton)`
  color: #fff;
  background: linear-gradient(90deg, #2e17f2 -24.77%, #fb52a1 186.93%);
  position: relative;
  z-index: 1;

  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(90deg, #2e17f2, #fb52a1);
    background-size: 200% 200%;
    filter: blur(16px);
    transform: scale(1);
    opacity: 1;
    transition: opacity 0.3s;
    border-radius: inherit;
    animation: ${gradientAnimation} 4s infinite linear;
  }
`
