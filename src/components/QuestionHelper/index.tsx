import { useCallback, useState } from 'react'
import { HelpCircle as Question } from 'react-feather'
import styled from 'styled-components'

import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div<{ width?: string }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: none;
  color: ${({ theme }) => theme.purple3};
  transition: opacity 0.3s ease;
  width: ${({ width }) => width ?? 20}px;
  height: 16px;

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const LightQuestionWrapper = styled.div`
  background-color: none;
  color: ${({ theme }) => theme.purple3};
  transition: opacity 0.3s ease;

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const QuestionMark = styled.span`
  font-size: 1rem;
`

export default function QuestionHelper({
  iconWrapperWidth = '20',
  text,
  className,
  size = 16,
}: {
  iconWrapperWidth?: string
  text: string
  className?: string
  size?: number
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <Tooltip text={text} show={show}>
      <QuestionWrapper
        onClick={open}
        onMouseEnter={open}
        onMouseLeave={close}
        className={className}
        width={iconWrapperWidth}
      >
        <Question size={size} />
      </QuestionWrapper>
    </Tooltip>
  )
}

export function LightQuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightQuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </LightQuestionWrapper>
      </Tooltip>
    </span>
  )
}
