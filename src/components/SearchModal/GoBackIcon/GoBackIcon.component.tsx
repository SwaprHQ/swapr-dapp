import React from 'react'
import { ButtonProps } from 'rebass'

import { ButtonInvisbile } from '../../Button'
import { StyledGoBackIcon } from './GoBackIcon.styles'

export const GoBackIcon = (props: ButtonProps) => {
  return (
    <ButtonInvisbile {...props}>
      <StyledGoBackIcon />
    </ButtonInvisbile>
  )
}
