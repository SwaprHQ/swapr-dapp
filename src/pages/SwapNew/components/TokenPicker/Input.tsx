import { ChangeEvent } from 'react'
import styled from 'styled-components'

type InputProps = {
  value: string
  placeholder: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Input({ value, placeholder, onChange }: InputProps) {
  return <StyledInput value={value} onChange={onChange} placeholder={placeholder} spellCheck={false} />
}

const StyledInput = styled.input`
  max-width: 536px;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  background: rgba(20, 18, 31, 0.5);
  border-radius: 12px;
  border: 2px solid #8c83c0;
  outline: none;
  line-height: 14px;
  font-size: 16px;
  font-family: Inter;
  font-weight: 500;
  color: #dddaf8;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.15);
  padding: 15px 20px;
  backdrop-filter: blur(12.5px);
  margin: 220px auto 0;
`
