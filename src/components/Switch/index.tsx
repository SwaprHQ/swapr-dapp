import React from 'react'
import './Switch.css'
interface SwitchInterface {
  isOn: boolean
  handleToggle: any
  label: string
  value: any
}
const Switch = ({ isOn, handleToggle, label, value }: SwitchInterface) => {
  return (
    <>
      <input
        value={value}
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        type="checkbox"
        id="switch"
      />
      <label className="react-switch-label" style={{ background: isOn ? '#2E17F2' : '' }} htmlFor={`react-switch-new`}>
        <span className="react-switch-button" />
      </label>
      {label}
    </>
  )
}

export default Switch
