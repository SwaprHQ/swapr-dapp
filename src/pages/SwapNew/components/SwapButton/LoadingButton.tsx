import { StyledButton, SwapButtonLabel } from './styles'

export function LoadingButton() {
  return (
    <StyledButton disabled={true}>
      <SwapButtonLabel light={true}>LOADING...</SwapButtonLabel>
    </StyledButton>
  )
}
