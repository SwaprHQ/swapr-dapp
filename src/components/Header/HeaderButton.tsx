import styled, { css, keyframes } from 'styled-components'

const gradientAnimation = keyframes`
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
	100% {background-position: 0% 50%;}
`

export const HeaderButton = styled.div<{
  glow?: boolean
}>`
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;
  background: linear-gradient(90deg, #2e17f2 -24.77%, #fb52a1 186.93%);
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: bold;
  font-size: 10px;
  line-height: 10px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  z-index: 1;

  ${({ glow }) =>
    glow &&
    css`
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
    `}
`
