import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../../components/Button'
import { ButtonConnect } from '../../components/ButtonConnect'
import Loader from '../../components/Loader'
import { AutoRow, RowBetween } from '../../components/Row'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { WrapType } from '../../hooks/useWrapCallback'
import React from 'react'
import { Field } from '../../state/swap/actions'
import { SwapButton, SwapLoadingButton } from '../../components/swap/SwapButton'
import Column from '../../components/Column'
import ProgressSteps from '../../components/ProgressSteps'
import { SwapCallbackError } from '../../components/swap/styleds'
import { useIsExpertMode } from '../../state/user/hooks'
import { useActiveWeb3React } from '../../hooks'
import { Currency, Trade, UniswapV2Trade } from '@swapr/sdk'
import { warningSeverity } from '../../utils/prices'

interface SwapButtonsProps {
  wrapInputError: string | undefined
  showApproveFlow: boolean
  userHasSpecifiedInputOutput: boolean
  approval: ApprovalState
  handleSwap: () => void
  setSwapState: any
  priceImpactSeverity: ReturnType<typeof warningSeverity>
  swapCallbackError: string | null
  onWrap: (() => Promise<void>) | undefined
  wrapType: WrapType
  approveCallback: () => Promise<void>
  approvalSubmitted: boolean
  currencies: { [field in Field]?: Currency }
  trade: Trade | undefined
  swapInputError: string | undefined
  swapErrorMessage: string | undefined
  loading: boolean
}

export function SwapButtons({
  wrapInputError,
  showApproveFlow,
  userHasSpecifiedInputOutput,
  approval,
  handleSwap,
  setSwapState,
  priceImpactSeverity,
  swapCallbackError,
  onWrap,
  wrapType,
  approveCallback,
  approvalSubmitted,
  currencies,
  trade,
  swapInputError,
  swapErrorMessage,
  loading,
}: SwapButtonsProps) {
  const { account } = useActiveWeb3React()
  const isExpertMode = useIsExpertMode()

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE
  const route = trade instanceof UniswapV2Trade ? trade?.route : true
  const noRoute = !route
  const isValid = !swapInputError

  if (loading) {
    return <SwapLoadingButton />
  }

  if (showApproveFlow) {
    return (
      <>
        <RowBetween>
          <ButtonConfirmed
            onClick={approveCallback}
            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            width="48%"
            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
            confirmed={approval === ApprovalState.APPROVED}
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Approving <Loader />
              </AutoRow>
            ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
              'Approved'
            ) : (
              'Approve ' + currencies[Field.INPUT]?.symbol
            )}
          </ButtonConfirmed>
          <ButtonError
            onClick={() => {
              if (isExpertMode) {
                handleSwap()
              } else {
                setSwapState({
                  tradeToConfirm: trade,
                  attemptingTxn: false,
                  swapErrorMessage: undefined,
                  showConfirm: true,
                  txHash: undefined,
                })
              }
            }}
            width="48%"
            id="swap-button"
            disabled={!isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)}
            error={isValid && priceImpactSeverity > 2}
          >
            {priceImpactSeverity > 3 && !isExpertMode
              ? `Price Impact High`
              : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
          </ButtonError>
        </RowBetween>
        <Column style={{ marginTop: '1rem' }}>
          <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
        </Column>
      </>
    )
  }

  if (isExpertMode && swapErrorMessage) {
    return <SwapCallbackError error={swapErrorMessage} />
  }

  if (!account) {
    return <ButtonConnect />
  }
  if (showWrap) {
    return (
      <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap} data-testid="wrap-button">
        {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
      </ButtonPrimary>
    )
  }
  if (noRoute && userHasSpecifiedInputOutput) {
    return (
      <ButtonPrimary style={{ textAlign: 'center' }} disabled>
        Insufficient liquidity
      </ButtonPrimary>
    )
  }

  return (
    <SwapButton
      onClick={() => {
        if (isExpertMode) {
          handleSwap()
        } else {
          setSwapState({
            tradeToConfirm: trade,
            attemptingTxn: false,
            swapErrorMessage: undefined,
            showConfirm: true,
            txHash: undefined,
          })
        }
      }}
      id="swap-button"
      disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
      platformName={trade?.platform.name}
      swapInputError={swapInputError}
      priceImpactSeverity={priceImpactSeverity}
      isExpertMode={isExpertMode}
    ></SwapButton>
  )
}
