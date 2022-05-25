import styled from 'styled-components'
import transparentize from 'polished/lib/color/transparentize'

import { breakpoints } from '../../utils/theme'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

export const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  margin-bottom: 8px;
  align-items: center;
`

export const CurrencySelect = styled.button<{ selected: boolean; disableCurrencySelect?: boolean }>`
  align-items: center;
  font-size: ${({ selected }) => (selected ? '26px' : '12px')};
  font-weight: ${({ selected }) => (selected ? 600 : 700)};
  background-color: ${({ selected, theme }) => (selected ? 'transparent' : theme.primary1)};
  border-radius: 8px;
  height: 28px;
  padding: ${({ selected }) => (selected ? '0' : '0 12px')};
  color: ${({ theme }) => theme.white};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: ${({ disableCurrencySelect }) => (disableCurrencySelect ? 'auto' : 'pointer')};
  user-select: none;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  ${({ disabled, theme }) =>
    disabled &&
    `
    background-color: ${theme.purple5};
    color: ${transparentize(0.28, theme.purpleBase)};
    cursor: not-allowed;
    box-shadow: none;
    outline: none;`}
`

export const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  margin-bottom: 8px;
`

export const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0 0 5px;
  height: 11px;
  width: 11px;
  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

export const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  z-index: 1;
`

export const Container = styled.div<{ focused: boolean }>`
  background-color: ${({ theme }) => theme.bg1And2};
  border: solid 1px ${({ focused, theme }) => (focused ? theme.bg3 : theme.bg1And2)};
  border-radius: 12px;
  transition: border 0.3s ease;
  padding: 18px 22px;
  @media screen and (max-width: ${breakpoints.md}) {
    padding: 18px 16px;
  }
`

export const Content = styled.div``

export const StyledTokenName = styled.span<{ active?: boolean }>`
  margin: ${({ active }) => (active ? '0 0 0 6px' : '0')};
  font-size: ${({ active }) => (active ? '16px' : '11px')};
  line-height: ${({ active }) => (active ? '20px' : '13px')};
  letter-spacing: 0.08em;
`

export const UppercaseHelper = styled.span`
  text-transform: uppercase;
`

export const FiatRow = styled.div``
