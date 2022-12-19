import { Box } from 'rebass'
import styled, { css, keyframes } from 'styled-components'

import { ButtonConfirmed, ButtonPrimary } from '../../../../components/Button'
import { AutoColumn } from '../../../../components/Column'
import { ExternalLink } from '../../../../theme'

export const expeditionsColorMixin = css`
  color: #fff;
  background: linear-gradient(90deg, #2e17f2 -24.77%, #fb52a1 186.93%);
`

export const Wrapper = styled.div`
  width: 100%;
  border-radius: 12px;
  background-color: #29253e;
`

export const Card = styled(Box)`
  display: flex;
  padding: 24px;
  flex-wrap: 'nowrap';
  gap: 16px;
`

export const StyledExternalLink = styled(ExternalLink)`
  font-size: 13px;
  font-style: italic;
  text-decoration: underline;
  display: inline;

  &:hover {
    color: white;
  }
`

const glowAnimation = keyframes`
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
	100% {background-position: 0% 50%;}
`

export const glowMixin = css`
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
    animation: ${glowAnimation} 4s infinite linear;
  }
`

export const ExpeditionsButton = styled(ButtonConfirmed)<{ expired?: boolean }>`
  padding: 8px;

  &${ButtonPrimary} {
    background-color: #161721;
    color: #3e4259;
    border: 1px solid #3e4259;
    ${({ expired }) =>
      expired &&
      `
    background: linear-gradient(0deg, rgba(174, 12, 57, 0.15), rgba(174, 12, 57, 0.15)), #161721;
    color: #F02E51;
    border: 1px solid rgba(240, 46, 81, 0.2);
    `}
  }
  &:not([disabled])${ButtonPrimary} {
    color: #fff;
    background: linear-gradient(90deg, #2e17f2 -24.77%, #fb52a1 186.93%);

    ${glowMixin}
  }
`

export const ScrollableAutoColumn = styled(AutoColumn)`
  justify-content: center;
  gap: 32px;
  overflow-y: scroll;
  width: calc(100% + 10px);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.bg3};
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.bg2};
  }
  //firefox support
  scrollbar-color: ${({ theme }) => theme.bg3 + ' ' + theme.bg2};
  scrollbar-width: thin;
`
