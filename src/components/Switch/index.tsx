import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'

import './Switch.css'
interface SwitchInterface {
  isOn: boolean
  handleToggle: () => void
  label: string
  style?: any
}
const Switch = ({ isOn, handleToggle, label, style }: SwitchInterface) => {
  const theme = useContext(ThemeContext)

  return (
    <>
      <input
        style={style}
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        type="checkbox"
        id={label}
        value={label}
      />
      <label className="react-switch-label" style={{ background: isOn ? theme.mainPurple : '' }} htmlFor={label}>
        <span className="react-switch-button" />
      </label>
      <Text
        marginLeft={'8px'}
        alignSelf={'center'}
        fontSize={'11px'}
        fontWeight={'500'}
        color={isOn ? theme.text2 : theme.purple2}
      >
        {label}
      </Text>
    </>
  )
}

export default Switch
