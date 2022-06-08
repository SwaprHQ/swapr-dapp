import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../../../components/Button'
import { ButtonConnect } from '../../../components/ButtonConnect'
import Loader from '../../../components/Loader'
import { AutoRow, RowBetween } from '../../../components/Row'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { WrapState, WrapType } from '../../../hooks/useWrapCallback'
import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { Field } from '../../../state/swap/actions'
import { SwapButton, SwapLoadingButton } from './SwapButton'
import Column from '../../../components/Column'
import ProgressSteps from '../../../components/ProgressSteps'
import { SwapCallbackError } from '../../../components/swap/styleds'
import { useIsExpertMode } from '../../../state/user/hooks'
import { useActiveWeb3React } from '../../../hooks'
import { Currency, GnosisProtocolTrade, Trade, UniswapV2Trade } from '@swapr/sdk'
import { warningSeverity } from '../../../utils/prices'
import { ROUTABLE_PLATFORM_STYLE } from '../../../constants'
import { SwapData } from '../../../pages/Swap'
import { wrappedAmount } from '@swapr/sdk/dist/entities/trades/utils'
import { useTranslation } from 'react-i18next'

const RoutablePlatformKeys = Object.keys(ROUTABLE_PLATFORM_STYLE)

enum GnosisProtocolTradeStatus {
  UNKNOWN, // default
  WRAP,
  APPROVAL,
  SWAP,
}

interface SwapButtonsProps {
  wrapInputError: string | undefined
  showApproveFlow: boolean
  userHasSpecifiedInputOutput: boolean
  approval: ApprovalState
  setSwapState: Dispatch<SetStateAction<SwapData>>
  priceImpactSeverity: ReturnType<typeof warningSeverity>
  swapCallbackError: string | null
  wrapType: WrapType
  approvalSubmitted: boolean
  currencies: { [field in Field]?: Currency }
  trade: Trade | undefined
  swapInputError: string | undefined
  swapErrorMessage: string | undefined
  loading: boolean
  handleSwap: () => void
  approveCallback: () => Promise<void>
  onWrap: (() => Promise<void>) | undefined
  wrapState: WrapState | undefined
  gnosisProtocolTradeStatus: GnosisProtocolTradeStatus
  setGnosisProtocolStatus: React.Dispatch<React.SetStateAction<GnosisProtocolTradeStatus>>
}

export function SwapButtons({
  wrapInputError,
  showApproveFlow,
  userHasSpecifiedInputOutput,
  approval,
  setSwapState,
  priceImpactSeverity,
  swapCallbackError,
  wrapType,
  approvalSubmitted,
  currencies,
  trade,
  swapInputError,
  swapErrorMessage,
  loading,
  handleSwap,
  approveCallback,
  onWrap,
  wrapState,
  gnosisProtocolTradeStatus,
  setGnosisProtocolStatus,
}: SwapButtonsProps) {
  const { account } = useActiveWeb3React()
  const isExpertMode = useIsExpertMode()
  const { t } = useTranslation()

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(trade instanceof GnosisProtocolTrade)
  const route = trade instanceof UniswapV2Trade ? trade?.route : true
  const noRoute = !route
  const isValid = !swapInputError

  useEffect(() => {
    RoutablePlatformKeys.forEach(key => {
      new Image().src = ROUTABLE_PLATFORM_STYLE[key].logo
    })
  }, [])

  // True when the wallet tries to trade native currency to ERC20
  const isGnosisProtocolTradeRequireWrap =
    trade instanceof GnosisProtocolTrade && Currency.getNative(trade?.chainId) == currencies?.INPUT && !swapInputError

  if (loading) {
    return <SwapLoadingButton />
  }

  if (!account) {
    return <ButtonConnect />
  }

  if (isGnosisProtocolTradeRequireWrap) {
    const midCurrency = trade && wrappedAmount(trade.inputAmount, trade.chainId).currency
    if (gnosisProtocolTradeStatus === GnosisProtocolTradeStatus.UNKNOWN)
      setGnosisProtocolStatus(GnosisProtocolTradeStatus.WRAP)
    const isApprovalRequired = approval !== ApprovalState.APPROVED
    const width = showApproveFlow && isApprovalRequired ? '31%' : '48%'

    const swapDisabled =
      !isValid ||
      isApprovalRequired ||
      (priceImpactSeverity > 3 && !isExpertMode) ||
      gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.SWAP

    return (
      <RowBetween>
        {
          <ButtonConfirmed
            onClick={onWrap}
            disabled={gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.WRAP || wrapState === WrapState.PENDING}
            width={width}
            altDisabledStyle={wrapState !== WrapState.UNKNOWN}
            confirmed={wrapState === WrapState.WRAPPED}
          >
            {wrapState === WrapState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Wrapping <Loader />
              </AutoRow>
            ) : wrapState === WrapState.WRAPPED ? (
              'Wrapped'
            ) : (
              'Wrap ' + currencies[Field.INPUT]?.symbol
            )}
          </ButtonConfirmed>
        }

        {// If the EOA needs to approve the WXDAI or any ERC20
        showApproveFlow && isApprovalRequired && (
          <ButtonConfirmed
            onClick={() => approveCallback().then(() => setGnosisProtocolStatus(GnosisProtocolTradeStatus.SWAP))}
            disabled={gnosisProtocolTradeStatus !== GnosisProtocolTradeStatus.APPROVAL || approvalSubmitted}
            width={width}
            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Approving <Loader />
              </AutoRow>
            ) : approvalSubmitted ? (
              'Approved'
            ) : (
              'Approve ' + midCurrency?.symbol
            )}
          </ButtonConfirmed>
        )}
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
          width={width}
          id="swap-button"
          // swapDisabled depends on the step of the process
          // errorMessage depends on the specific details in the swap step
          // standard disable or if there is some kind of problem
          disabled={swapDisabled} // || errorMessage != null}
          platformName={trade?.platform.name}
          priceImpactSeverity={priceImpactSeverity}
          isExpertMode={isExpertMode}
        >
          {priceImpactSeverity > 3 && !isExpertMode
            ? t('PriceImpactHigh')
            : `${priceImpactSeverity > 2 ? t('swapAnyway') : t('swap')}`}
        </SwapButton>
      </RowBetween>
    )
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
              ? t('PriceImpactHigh')
              : `${priceImpactSeverity > 2 ? t('swapAnyway') : t('swap')}`}
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
