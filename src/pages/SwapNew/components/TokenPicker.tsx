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

  return createPortal(<Container></Container>, tokenPickerContainer)
}

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(7px);
`
