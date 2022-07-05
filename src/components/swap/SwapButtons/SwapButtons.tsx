import { Currency, GnosisProtocolTrade, Trade, UniswapV2Trade } from '@swapr/sdk'

import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { wrappedCurrency } from 'utils/wrappedCurrency'

import { ButtonConfirmed, ButtonError, ButtonPrimary } from '../../../components/Button'
import { ButtonConnect } from '../../../components/ButtonConnect'
import Column from '../../../components/Column'
import Loader from '../../../components/Loader'
import ProgressSteps from '../../../components/ProgressSteps'
import { AutoRow, RowBetween } from '../../../components/Row'
import { SwapCallbackError } from '../../../components/swap/styleds'
import { PRICE_IMPACT_HIGH, PRICE_IMPACT_MEDIUM, ROUTABLE_PLATFORM_STYLE } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { WrapState, WrapType } from '../../../hooks/useWrapCallback'
import { SwapData } from '../../../pages/Swap'
import { Field } from '../../../state/swap/actions'
import { useIsExpertMode } from '../../../state/user/hooks'
import { warningSeverity } from '../../../utils/prices'
import { SwapButton, SwapLoadingButton } from './SwapButton'

const RoutablePlatformKeys = Object.keys(ROUTABLE_PLATFORM_STYLE)

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
  swapInputError: number | undefined
  swapErrorMessage: string | undefined
  loading: boolean
  handleSwap: () => void
  approveCallback: () => Promise<void>
  onWrap: (() => Promise<void>) | undefined
  handleInputSelect: (inputCurrency: Currency) => void
  wrapState?: WrapState | undefined
  setWrapState: ((wrapState: WrapState) => void) | undefined
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
  handleInputSelect,
  wrapState,
  setWrapState,
}: SwapButtonsProps) {
  const { account } = useActiveWeb3React()
  const isExpertMode = useIsExpertMode()
  const { t } = useTranslation()

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE
  const route = trade instanceof UniswapV2Trade ? trade?.route : true
  const noRoute = !route
  const isValid = !swapInputError

  useEffect(() => {
    RoutablePlatformKeys.forEach(key => {
      new Image().src = ROUTABLE_PLATFORM_STYLE[key].logo
    })
  }, [])

  useEffect(() => {
    const wrappedToken = wrappedCurrency(trade?.inputAmount.currency, trade?.chainId)
    if (
      wrappedToken &&
      trade instanceof GnosisProtocolTrade &&
      wrapState === WrapState.WRAPPED &&
      currencies.INPUT &&
      Currency.isNative(currencies.INPUT)
    ) {
      handleInputSelect(wrappedToken)
      setWrapState && setWrapState(WrapState.UNKNOWN)
    }
  }, [currencies, trade, handleInputSelect, wrapState, setWrapState])

  const onSwapClick = useCallback(() => {
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
  }, [isExpertMode, handleSwap, setSwapState, trade])

  if (loading) {
    return <SwapLoadingButton />
  }

  if (!account) {
    return <ButtonConnect />
  }

  if (showWrap) {
    return (
      <ButtonPrimary
        disabled={Boolean(wrapInputError) || wrapState === WrapState.PENDING}
        onClick={onWrap}
        data-testid="wrap-button"
      >
        {wrapInputError ??
          (wrapState === WrapState.PENDING
            ? 'Wrapping'
            : wrapType === WrapType.WRAP
            ? 'Wrap'
            : wrapType === WrapType.UNWRAP
            ? 'Unwrap'
            : null)}
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
            onClick={onSwapClick}
            width="48%"
            id="swap-button"
            disabled={
              !isValid ||
              approval !== ApprovalState.APPROVED ||
              (priceImpactSeverity > PRICE_IMPACT_HIGH && !isExpertMode)
            }
            error={isValid && priceImpactSeverity > PRICE_IMPACT_MEDIUM}
          >
            {priceImpactSeverity > PRICE_IMPACT_HIGH && !isExpertMode
              ? t('PriceImpactHigh')
              : `${priceImpactSeverity > PRICE_IMPACT_MEDIUM ? t('swapAnyway') : t('swap')}`}
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
      onClick={onSwapClick}
      id="swap-button"
      disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
      platformName={trade?.platform.name}
      swapInputError={swapInputError}
      priceImpactSeverity={priceImpactSeverity}
      isExpertMode={isExpertMode}
      amountInCurrencySymbol={currencies[Field.INPUT]?.symbol}
    />
  )
}
