import { transparentize } from 'polished'
import styled, { css } from 'styled-components'

import border8pxRadius from '../../assets/images/border-8px-radius.png'
import { Option } from '../Option'

export const Input = styled.input`
  background: ${({ theme }) => theme.bg2};
  font-size: 15px;
  line-height: 18px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: right;
  display: flex;
`

export const OptionCustom = styled(Option)<{
  active?: boolean
  warning?: boolean
  focused?: boolean
}>`
  position: relative;
  flex: 1;
  display: flex;
  border: 8px solid;
  border-radius: 8px;
  ${({ focused }) =>
    focused
      ? css`
          border: solid 1px ${({ theme }) => theme.bg5};
          padding: 7px 11px;
        `
      : css`
          border: 8px solid transparent;
          border-image: url(${border8pxRadius}) 8;
          padding: 0px 4px;
        `};

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 8px;
  }
`

export const SlippageErrorInner = styled.div<{ isInputValid: boolean }>`
  background-color: ${({ theme, isInputValid }) => transparentize(0.9, isInputValid ? theme.orange1 : theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 12px;
  width: 100%;
  padding: 0.5rem;
  color: ${({ theme, isInputValid }) => (isInputValid ? theme.orange1 : theme.red1)};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

export const SlippageErrorInnerAlertTriangle = styled.div<{ isInputValid: boolean }>`
  background-color: ${({ theme, isInputValid }) => transparentize(0.9, isInputValid ? theme.orange1 : theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 36px;
  height: 36px;
`
