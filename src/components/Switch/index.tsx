import React from 'react'
import { Text } from 'rebass'
import './Switch.css'
interface SwitchInterface {
  isOn: boolean
  handleToggle: () => void
  label: string
  style?: any
}
const Switch = ({ isOn, handleToggle, label, style }: SwitchInterface) => {
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
      <label className="react-switch-label" style={{ background: isOn ? '#2E17F2' : '' }} htmlFor={label}>
        <span className="react-switch-button" />
      </label>
      <Text
        marginLeft={'8px'}
        alignSelf={'center'}
        fontSize={'11px'}
        fontWeight={'500'}
        color={isOn ? '#EBE9F8' : '#C0BAF6'}
      >
        {label}
      </Text>
    </>
  )
}

export default Switch
