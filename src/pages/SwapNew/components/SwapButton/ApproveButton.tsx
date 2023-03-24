import { Loader } from '../../../../components/Loader'
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
  console.log('APPROVAL:', approval)
  return (
    <StyledButton
      onClick={approval !== ApprovalState.APPROVED ? approveCallback : handleSwap}
      disabled={approval === ApprovalState.PENDING}
    >
      {(() => {
        if (approval === ApprovalState.PENDING)
          return (
            <SwapButtonLabel>
              Approving <Loader />
            </SwapButtonLabel>
          )
        if (approval === ApprovalState.APPROVED) return <SwapButtonLabel>Swap</SwapButtonLabel>

        return <SwapButtonLabel>Approve {amountInCurrencySymbol}</SwapButtonLabel>
      })()}
    </StyledButton>
  )
}
