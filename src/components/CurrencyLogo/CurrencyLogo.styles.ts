import styled from 'styled-components'
import Logo from '../Logo'

export const StyledLogo = styled(Logo)<{ size: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
`

export const Wrapper = styled.div<{ size: string; marginRight: number; marginLeft: number; isLoading?: boolean }>`
  position: relative;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  margin-right: ${({ marginRight }) => marginRight}px;
  margin-left: ${({ marginLeft }) => marginLeft}px;
  border-radius: ${({ size }) => size};
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    ${({ size }) => `width: calc(${size} - 1px)`};
    ${({ size }) => `height: calc(${size} - 1px)`};
    background-color: ${props => (props.isLoading ? 'transparent' : props.theme.white)};
    border-radius: 50%;
    z-index: -1;
  }
`
