import styled from 'styled-components'
import { Flex } from 'rebass'
import { transparentize } from 'polished'

import { AutoColumn } from '../../Column'
import { RowBetween } from '../../Row'

import border8pxRadius from '../../../assets/images/border-8px-radius.png'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
  padding-bottom: 12px;
`

export const MenuItem = styled(RowBetween)`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 8px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.bg1And2};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

export const TokenPickerItem = styled(Flex)`
  padding: 0 12.5px 0 22.5px;
  height: 56px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  transition: background-color 0.3s ease;
  background-color: transparent;
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && transparentize(0.4, theme.bg3)};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

export const SearchInput = styled.input<{ fontSize?: string; fontWeight?: number }>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${({ width }) => (width ? width : '100%')};
  height: ${({ height }) => (height ? height : '44px')};
  white-space: nowrap;
  background: ${({ theme }) => transparentize(0.75, theme.purpleBase)};
  border-radius: 8px;
  border: 8px solid transparent;
  border-image: url(${border8pxRadius}) 8;
  padding: 8px 12px;
  :focus {
    border: solid 1px ${({ theme }) => theme.bg5};
    padding: 15px 19px;
  }
  outline: none;
  color: ${({ theme }) => theme.white};
  -webkit-appearance: none;

  font-size: ${({ fontSize }) => (fontSize ? fontSize : '16px')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 'normal')};

  ::placeholder {
    color: ${({ theme }) => theme.purple5};
  }
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => transparentize(0.5, theme.purple5)};
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

export const Checkbox = styled.input`
  border: 1px solid ${({ theme }) => theme.red2};
  height: 20px;
  margin: 0;
`

export const TextDot = styled.div`
  height: 3px;
  width: 3px;
  background-color: ${({ theme }) => theme.text2};
  border-radius: 50%;
`
