import { Trade } from '@swapr/sdk'

import { useTranslation } from 'react-i18next'

import { SWAP_INPUT_ERRORS } from '../../../../constants'
import { ROUTABLE_PLATFORM_STYLE } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { ApprovalState } from '../../../../hooks/useApproveCallback'
import { WrapState, WrapType } from '../../../../hooks/useWrapCallback'
import { ApproveButton } from './ApproveButton'
import { ConnectWalletButton } from './ConnectWalletButton'
import { LoadingButton } from './LoadingButton'
import { StyledButton, SwapButtonLabel, PlatformLogo } from './styles'
import { WrapButton } from './WrapButton'

type SwapButtonProps = {
  platformName?: string
  swapInputError?: number
  priceImpactSeverity: number
  loading: boolean
  amountInCurrencySymbol?: string
  trade?: Trade
  handleSwap: () => void
  showWrap?: boolean
  wrapInputError: string | undefined
  wrapState?: WrapState | undefined
  onWrap: (() => Promise<void>) | undefined
  wrapType: WrapType
  showApproveFlow: boolean
  approval: ApprovalState
  approvalSubmitted: boolean
  approveCallback: () => Promise<void>
}

export function SwapButton({
  swapInputError,
  loading,
  amountInCurrencySymbol,
  trade,
  handleSwap,
  showWrap,
  wrapInputError,
  wrapState,
  onWrap,
  wrapType,
  showApproveFlow,
  approval,
  approvalSubmitted,
  approveCallback,
}: SwapButtonProps) {
  const { t } = useTranslation('swap')
  const { account } = useActiveWeb3React()

  const SWAP_INPUT_ERRORS_MESSAGE = {
    [SWAP_INPUT_ERRORS.CONNECT_WALLET]: t('button.connectWallet'),
    [SWAP_INPUT_ERRORS.ENTER_AMOUNT]: t('button.enterAmount'),
    [SWAP_INPUT_ERRORS.SELECT_TOKEN]: t('button.selectToken'),
    [SWAP_INPUT_ERRORS.ENTER_RECIPIENT]: t('button.enterRecipient'),
    [SWAP_INPUT_ERRORS.INVALID_RECIPIENT]: t('button.invalidRecipient'),
    [SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE]: t('button.insufficientCurrencyBalance', {
      currency: amountInCurrencySymbol,
    }),
  }

  const platformName = trade?.platform.name

  if (loading) return <LoadingButton />

  if (!account) return <ConnectWalletButton />

  if (showWrap)
    return <WrapButton wrapInputError={wrapInputError} wrapState={wrapState} onWrap={onWrap} wrapType={wrapType} />

  if (showApproveFlow)
    return (
      <ApproveButton
        amountInCurrencySymbol={amountInCurrencySymbol}
        approveCallback={approveCallback}
        approval={approval}
        approvalSubmitted={approvalSubmitted}
        handleSwap={handleSwap}
      />
    )

  return (
    <StyledButton disabled={swapInputError ? true : false} onClick={handleSwap}>
      {(() => {
        if (swapInputError)
          return <SwapButtonLabel light={true}>{SWAP_INPUT_ERRORS_MESSAGE[swapInputError]}</SwapButtonLabel>

        return (
          <>
            <SwapButtonLabel>Swap With</SwapButtonLabel>
            <PlatformLogo
              src={ROUTABLE_PLATFORM_STYLE[platformName!].logo}
              alt={ROUTABLE_PLATFORM_STYLE[platformName!].alt}
            />
            <SwapButtonLabel>{ROUTABLE_PLATFORM_STYLE[platformName!].name}</SwapButtonLabel>
          </>
        )
      })()}
    </StyledButton>
  )
}
