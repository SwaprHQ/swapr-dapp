import { ApprovalState } from '../../../../hooks/useApproveCallback'
import { StyledButton, SwapButtonLabel } from './styles'

type ApproveButtonProps = {
  amountInCurrencySymbol?: string
  approval: ApprovalState
  approvalSubmitted: boolean
  approveCallback: () => Promise<void>
}

export function ApproveButton({
  amountInCurrencySymbol,
  approval,
  approvalSubmitted,
  approveCallback,
}: ApproveButtonProps) {
  return (
    <StyledButton onClick={approveCallback}>
      <SwapButtonLabel>Approve {amountInCurrencySymbol}</SwapButtonLabel>
    </StyledButton>
  )
}
