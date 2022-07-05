import classNames from 'classnames'
import React from 'react'

import './Switch.css'
interface SwitchProps {
  isOn: boolean
  isRed?: boolean
  handleToggle: () => void
  label?: string
  style?: React.CSSProperties
}

export const Switch = ({ isOn, handleToggle, label, style, isRed = false }: SwitchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        style={style}
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        type="checkbox"
        id={label ? label : handleToggle.name}
        value={label ? label : handleToggle.name}
      />
      <label
        className={classNames('react-switch-label', {
          'bg-mainBlue': isOn,
          'bg-purple5': !isOn,
          'bg-red-600': isOn && isRed,
          'bg-[#3933584D] outline-1	outline-text2': !isOn && isRed,
        })}
        htmlFor={label ? label : handleToggle.name}
      >
        <p
          className={classNames('react-switch-button', {
            'bg-white': isOn,
            'bg-purple2': !isOn,
            'bg-black': isOn && isRed,
          })}
        />
      </label>
      {label && (
        <p className={classNames('uppercase text-xs', { 'text-white': isOn, 'text-purple2': !isOn })}>{label}</p>
      )}
    </div>
  )
}
