import { ButtonProps } from 'rebass'

import { ButtonInvisible } from '../../Button'
import { StyledGoBackIcon } from './GoBackIcon.styles'

export const GoBackIcon = (props: ButtonProps) => {
  return (
    <ButtonInvisible {...props}>
      <StyledGoBackIcon />
    </ButtonInvisible>
  )
}
