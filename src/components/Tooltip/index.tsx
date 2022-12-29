import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div`
  width: 228px;
  line-height: 150%;
  font-weight: 400;
`

const CursorPointerDiv = styled.div`
  cursor: pointer;
`

interface TooltipProps extends PopoverProps {
  text?: string
  disabled?: boolean
}

export default function Tooltip({ text, ...rest }: Omit<TooltipProps, 'content'>) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function CustomTooltip({ content, placement, ...rest }: PopoverProps) {
  return <Popover offsetY={3} placement={placement ?? 'bottom'} content={content} {...rest} />
}

export function MouseoverTooltip({ children, disabled, content, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)

  // Sometimes onMouseLeave is not triggered so this is a fallback to remove tooltip
  useEffect(() => {
    const id = setTimeout(() => {
      setShow(false)
    }, 2000)
    return () => {
      clearTimeout(id)
    }
  }, [show])

  const open = useCallback(() => setShow(disabled ? false : true), [disabled])
  const close = useCallback(() => setShow(false), [])

  return (
    <CursorPointerDiv onClick={open} onMouseEnter={open} onMouseLeave={close}>
      <CustomTooltip content={content} {...rest} show={show}>
        {children}
      </CustomTooltip>
    </CursorPointerDiv>
  )
}
