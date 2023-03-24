import { ApprovalState } from '../../../../hooks/useApproveCallback'
import { StyledButton, SwapButtonLabel } from './styles'

type ApproveButtonProps = {
  amountInCurrencySymbol?: string
  approval: ApprovalState
  approvalSubmitted: boolean
  approveCallback: () => Promise<void>
  handleSwap: () => void
}

export function ApproveButton({
  amountInCurrencySymbol,
  approval,
  approvalSubmitted,
  approveCallback,
  handleSwap,
}: ApproveButtonProps) {
  return (
    <StyledButton
      onClick={approval !== ApprovalState.APPROVED ? approveCallback : handleSwap}
      disabled={approval === ApprovalState.PENDING}
    >
      {approval !== ApprovalState.APPROVED ? (
        <SwapButtonLabel>Approve {amountInCurrencySymbol}</SwapButtonLabel>
      ) : (
        <SwapButtonLabel>Swap</SwapButtonLabel>
      )}
    </StyledButton>
  )
}
