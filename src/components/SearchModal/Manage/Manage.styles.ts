import styled from 'styled-components'
import { Flex } from 'rebass'
import { animated } from '@react-spring/web'

import { RowBetween } from '../../Row'

export const Wrapper = styled(Flex)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg1And2};
  flex-direction: column;
`

export const ToggleWrapper = styled(RowBetween)`
  position: relative;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  padding: 6px;
`

export const TabContainer = styled.div`
  display: flex;
  overflow: hidden;
`

export const Slide = styled.div`
  width: 100%;
  flex-shrink: 0;
`
export const AnimatedSlide = animated(Slide)

export const ToggleOption = styled.button<{ active: boolean }>`
  width: 48%;
  background-color: transparent;
  border: none;
  outline: none;
  padding: 10px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

export const ToggleIndicator = styled.div`
  width: 48%;
  height: calc(100% - 12px);
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1And2};
  position: absolute;
`
export const AnimatedToggleIndicator = animated(ToggleIndicator)
