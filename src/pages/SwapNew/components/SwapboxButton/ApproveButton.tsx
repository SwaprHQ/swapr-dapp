import { Loader } from '../../../../components/Loader'
import { ApprovalState } from '../../../../hooks/useApproveCallback'
import { StyledButton, SwapButtonLabel } from './styles'

type ApproveButtonProps = {
  amountInCurrencySymbol?: string
  approval: ApprovalState
  approveCallback: () => Promise<void>
  handleSwap: () => void
  swapInputError?: number
}

export function ApproveButton({
  amountInCurrencySymbol,
  approval,
  approveCallback,
  handleSwap,
  swapInputError,
}: ApproveButtonProps) {
  return (
    <StyledButton
      onClick={approval !== ApprovalState.APPROVED ? approveCallback : handleSwap}
      disabled={approval === ApprovalState.PENDING || !!swapInputError}
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
