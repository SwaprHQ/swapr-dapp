import React from 'react'
import { Text } from 'rebass'

import styled from 'styled-components'
import './Switch.css'

const StyledLabel = styled.label<{ isOn: boolean }>`
  background: ${props => props.isOn && `${props.theme.mainPurple}!important`};
`
const StyledText = styled(Text)<{ isOn: boolean }>`
  color: ${props => (props.isOn ? props.theme.text2 : props.theme.purple2)};
`
interface SwitchProps {
  isOn: boolean
  handleToggle: () => void
  label?: string
  style?: React.CSSProperties
}

export const Switch = ({ isOn, handleToggle, label, style }: SwitchProps) => {
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
      <StyledLabel className="react-switch-label" isOn={isOn} htmlFor={label ? label : handleToggle.name}>
        <span className="react-switch-button" />
      </StyledLabel>
      {label && (
        <StyledText isOn={isOn} marginLeft={'8px'} alignSelf={'center'} fontSize={'11px'} fontWeight={'500'}>
          {label}
        </StyledText>
      )}
    </>
  )
}
