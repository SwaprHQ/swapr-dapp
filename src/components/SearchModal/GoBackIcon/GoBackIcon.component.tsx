import React from 'react'
import { ButtonProps } from 'rebass'

import { ButtonInvisble } from '../../Button/Button'
import { StyledGoBackIcon } from './GoBackIcon.styles'

export const GoBackIcon = (props: ButtonProps) => {
  return (
    <ButtonInvisble {...props}>
      <StyledGoBackIcon />
    </ButtonInvisble>
  )
}
