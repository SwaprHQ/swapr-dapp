import { transparentize } from 'polished'
import { AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { breakpoints } from '../../utils/theme'
import { AutoColumn } from '../Column'

export const Wrapper = styled.div`
  position: relative;
`

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  padding: 2px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SwitchTokensAmountsContainer = styled.div`
  background-color: ${props => props.theme.bg1And2};
  width: 51px;
  height: 51px;
  position: absolute;
  left: 50%;
  top: -26px;
  transform: translateX(-50%);
  z-index: 2;
  border-radius: 50%;
  border: solid 5px ${props => props.theme.dark1};
  cursor: pointer;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 42px;
    height: 42px;
    top: -20px;
  }
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text1
      : theme.green1};
`

export const StyledBalanceMaxMini = styled.button`
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.purple3};
  display: flex;
  align-items: center;
  padding: 0;
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  width: 220px;
  overflow: hidden;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div<{
  isSpaceAtTop?: boolean
}>`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: ${({ isSpaceAtTop }) => (isSpaceAtTop ? '1rem 1.25rem 1rem 1rem' : '3rem 1.25rem 1rem 1rem')};
  margin-top: ${({ isSpaceAtTop }) => (isSpaceAtTop ? '' : '-2rem')};
  color: ${({ theme }) => theme.red1};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error, isSpaceAtTop }: { error: string; isSpaceAtTop?: boolean }) {
  return (
    <SwapCallbackErrorInner isSpaceAtTop={isSpaceAtTop}>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary1)};
  color: ${({ theme }) => theme.primary1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const SwitchIconContainer = styled.div`
  height: 0;
  position: relative;
  width: 100%;
`
