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
}

export default function Tooltip({ text, ...rest }: Omit<TooltipProps, 'content'>) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function CustomTooltip({ content, placement, ...rest }: PopoverProps) {
  return <Popover offsetY={3} placement={placement ?? 'bottom'} content={content} {...rest} />
}

export function MouseoverTooltip({ children, content, ...rest }: Omit<TooltipProps, 'show'>) {
  const [canShow, setShow] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => {
      setShow(false)
    }, 2000)
    return () => {
      clearTimeout(id)
    }
  }, [canShow])
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <CustomTooltip content={content} {...rest} show={canShow}>
      <CursorPointerDiv onMouseEnter={open} onMouseLeave={close}>
        {children}
      </CursorPointerDiv>
    </CustomTooltip>
  )
}
