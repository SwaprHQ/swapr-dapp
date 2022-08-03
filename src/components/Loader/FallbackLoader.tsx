import { useEffect } from 'react'
import styled, { css, keyframes } from 'styled-components'

import Logo from '../../assets/svg/logo_white.svg'

const pulse = keyframes`
  0% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const Wrapper = styled.div<FallbackLoaderProps>`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ height }: { height?: string }) => (height ? height : '180px')};
  width: 100%;

  ${props =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 100%;
        `}
`

const AnimatedImg = styled.div`
  animation: ${pulse} 800ms linear infinite;
  & > * {
    width: 72px;
  }
`
interface FallbackLoaderProps {
  fill?: boolean
  height?: string
}
export function FallbackLoader({ fill, height }: FallbackLoaderProps) {
  useEffect(() => {
    new Image().src = Logo
  }, [])
  return (
    <Wrapper fill={fill} height={height}>
      <AnimatedImg>
        <img src={Logo} alt="loading-icon" />
      </AnimatedImg>
    </Wrapper>
  )
}
