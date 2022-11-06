import { ButtonPrimary } from '../../../../components/Button'
import { Loader } from '../../../../components/Loader'
import ProgressSteps from '../../../../components/ProgressSteps'
import { AutoRow } from '../../../../components/Row'
import { ApprovalState } from '../../../../hooks/useApproveCallback'

interface ApprovalFlowProps {
  approval: ApprovalState
  approveCallback: () => Promise<void>
  tokenInSymbol: string
}

export const ApprovalFlow = ({ approval, approveCallback, tokenInSymbol }: ApprovalFlowProps) => (
  <>
    <ButtonPrimary
      onClick={approveCallback}
      disabled={approval !== ApprovalState.NOT_APPROVED /* || approvalSubmitted */}
      altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
    >
      {approval === ApprovalState.PENDING ? (
        <AutoRow gap="6px" justify="center">
          Approving <Loader />
        </AutoRow>
      ) : (
        'Approve ' + tokenInSymbol
      )}
    </ButtonPrimary>
    <div style={{ marginTop: '1rem' }}>
      <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
    </div>
  </>
)
