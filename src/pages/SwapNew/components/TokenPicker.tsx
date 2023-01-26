import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

export function TokenPicker() {
  const [tokenPickerContainer] = useState(() => document.createElement('div'))

  useEffect(() => {
    tokenPickerContainer.classList.add('token-picker-root')
    document.body.appendChild(tokenPickerContainer)

    return () => {
      document.body.removeChild(tokenPickerContainer)
    }
  }, [tokenPickerContainer])

  return createPortal(
    <Container>
      <Input placeholder="Search token by name or paste address" spellCheck={false} />
      <TokenBalanceContainer>
        <TokenItem>ETH</TokenItem>
        <TokenItem>USDC</TokenItem>
        <TokenItem>DXD</TokenItem>
        <TokenItem>SWPR</TokenItem>
      </TokenBalanceContainer>
    </Container>,
    tokenPickerContainer
  )
}

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(7px);
`

const Input = styled.input`
  width: 478px;
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
  margin-top: 220px;
`

const TokenBalanceContainer = styled.div`
  width: 478px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`

const TokenItem = styled.p`
  height: 38px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid #464366;
  padding: 10px 14px;
  line-height: 18px;
  font-size: 14px;
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #bcb3f0;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -185.11%, rgba(46, 23, 242, 0) 49.63%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.5) -0.1%, rgba(0, 0, 0, 0) 98.9%), rgba(57, 51, 88, 0.3);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(12.5px);
`
