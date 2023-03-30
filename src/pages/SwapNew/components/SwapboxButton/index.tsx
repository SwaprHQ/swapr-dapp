import { Trade } from '@swapr/sdk'

import { useActiveWeb3React } from '../../../../hooks'
import { ApprovalState } from '../../../../hooks/useApproveCallback'
import { WrapState, WrapType } from '../../../../hooks/useWrapCallback'
import { ApproveButton } from './ApproveButton'
import { ConnectWalletButton } from './ConnectWalletButton'
import { LoadingButton } from './LoadingButton'
import { SwapButton } from './SwapButton'
import { WrapButton } from './WrapButton'

type SwapboxButtonProps = {
  platformName?: string
  swapInputError?: number
  priceImpactSeverity: number
  loading: boolean
  amountInCurrencySymbol?: string
  trade?: Trade
  handleSwap: () => void
  swapCallbackError: string | null
  showWrap?: boolean
  wrapInputError: string | undefined
  wrapState?: WrapState | undefined
  onWrap: (() => Promise<void>) | undefined
  wrapType: WrapType
  showApproveFlow: boolean
  approval: ApprovalState
  approveCallback: () => Promise<void>
}

export function SwapboxButton({
  swapInputError,
  loading,
  amountInCurrencySymbol,
  trade,
  handleSwap,
  swapCallbackError,
  showWrap,
  wrapInputError,
  wrapState,
  onWrap,
  wrapType,
  showApproveFlow,
  approval,
  approveCallback,
}: SwapboxButtonProps) {
  const { account } = useActiveWeb3React()

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
        handleSwap={handleSwap}
        swapInputError={swapInputError}
      />
    )

  return (
    <SwapButton
      amountInCurrencySymbol={amountInCurrencySymbol}
      swapInputError={swapInputError}
      trade={trade}
      handleSwap={handleSwap}
      swapCallbackError={swapCallbackError}
    />
  )
}
