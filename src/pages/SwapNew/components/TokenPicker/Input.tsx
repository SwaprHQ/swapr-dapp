import { ChangeEvent } from 'react'
import styled from 'styled-components'

import { ReactComponent as CloseSmallSVG } from '../../../../assets/swapbox/close-small.svg'

type InputProps = {
  value: string
  placeholder: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function Input({ value, placeholder, onChange }: InputProps) {
  return (
    <InputContainer>
      <StyledInput value={value} onChange={onChange} placeholder={placeholder} spellCheck={false} />
      <ClearInputButton />
    </InputContainer>
  )
}

const InputContainer = styled.div`
  max-width: 536px;
  width: 100%;
  position: relative;
`

const StyledInput = styled.input`
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

const ClearInputButton = styled.button`
  width: 17px;
  height: 17px;
  background: rgba(60, 56, 100, 0.1);
  border: 1px solid #2a2f42;
  border-radius: 1000px;
  box-shadow: inset 0px 1.11185px 6.6711px rgba(165, 164, 255, 0.08),
    inset 6.6711px 2.2237px 11.1185px rgba(143, 141, 255, 0.1);
  backdrop-filter: blur(5px);
`
