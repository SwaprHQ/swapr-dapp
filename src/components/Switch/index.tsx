import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import './Switch.css'

const StyledLabel = styled.label<{ isOn: boolean; isRed: boolean }>`
  ${({ isRed, isOn }) => isRed && !isOn && 'outline: 1px solid #464366;outline-offset: -1px;'};
  background: ${({ isOn, isRed, theme }) =>
    isOn && isRed ? '#F02E51' : !isOn && isRed ? '#3933584D' : isOn ? `${theme.mainPurple}` : `${theme.purple5}`};
`
const StyledText = styled(Text)<{ isOn: boolean }>`
  color: ${({ theme, isOn }) => (isOn ? theme.text2 : theme.purple2)};
`
const StyledSpan = styled.span<{ isOn: boolean; isRed: boolean }>`
  background: ${({ isOn, isRed }) => (isOn && isRed ? 'black' : isOn ? '#fff' : '#c0baf6')};
`
interface SwitchProps {
  isOn: boolean
  isRed?: boolean
  handleToggle: () => void
  label?: string
  style?: React.CSSProperties
}

export const Switch = ({ isOn, handleToggle, label, style, isRed = false }: SwitchProps) => {
  return (
    <>
      <input
        style={style}
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        type="checkbox"
        id={label ? label : handleToggle.name}
        value={label ? label : handleToggle.name}
      />
      <StyledLabel className="react-switch-label" isRed={isRed} isOn={isOn} htmlFor={label ? label : handleToggle.name}>
        <StyledSpan isRed={isRed} isOn={isOn} className="react-switch-button" />
      </StyledLabel>
      {label && (
        <StyledText isOn={isOn} marginLeft={'8px'} alignSelf={'center'} fontSize={'11px'} fontWeight={'500'}>
          {label}
        </StyledText>
      )}
    </>
  )
}
