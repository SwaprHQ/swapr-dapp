import { StyledButton, SwapButtonLabel } from './styles'

type ApproveButtonProps = {
  amountInCurrencySymbol?: string
}

export function ApproveButton({ amountInCurrencySymbol }: ApproveButtonProps) {
  return (
    <StyledButton>
      <SwapButtonLabel>Approve {amountInCurrencySymbol}</SwapButtonLabel>
    </StyledButton>
  )
}
