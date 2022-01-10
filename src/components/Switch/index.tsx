import React from 'react'
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
      />
      <label className="react-switch-label" style={{ background: isOn ? '#2E17F2' : '' }} htmlFor={`react-switch-new`}>
        <span className="react-switch-button" />
      </label>
      {label}
    </>
  )
}

export default Switch
