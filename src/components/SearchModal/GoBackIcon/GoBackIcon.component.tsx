import { ButtonProps } from 'rebass'

import { StyledGoBackIcon } from './GoBackIcon.styles'
import { ButtonInvisible } from '../../Button'

export const GoBackIcon = (props: ButtonProps) => {
  return (
    <ButtonInvisible {...props}>
      <StyledGoBackIcon />
    </ButtonInvisible>
  )
}
