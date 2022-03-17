import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../../../theme'
import { AutoColumn } from '../../../Column'

interface StepProps {
  disabled: boolean
  index: number
  title: string
  children: React.ReactNode
}

const Root = styled(AutoColumn)<{ disabled: boolean }>`
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  transition: opacity 0.3s ease;
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  z-index: 1;
  text-transform: capitalize;
`

export default function Step({ disabled, index, title, children, ...rest }: StepProps) {
  return (
    <Root gap="31px" disabled={disabled} {...rest}>
      <TYPE.subHeader fontSize={18} lineHeight="22px" color="#EBE9F8">
        {index + 1}. {title}
      </TYPE.subHeader>
      {children}
    </Root>
  )
}
