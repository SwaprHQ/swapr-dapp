import { Trade } from '@swapr/sdk'

import { useTranslation } from 'react-i18next'

import { ROUTABLE_PLATFORM_STYLE, SWAP_INPUT_ERRORS } from '../../../../constants'
import { StyledButton, SwapButtonLabel, PlatformLogo } from './styles'

type SwapButtonProps = {
  amountInCurrencySymbol?: string
  swapInputError?: number
  trade?: Trade
  handleSwap: () => void
  swapCallbackError: string | null
}

export function SwapButton({
  amountInCurrencySymbol,
  swapInputError,
  trade,
  handleSwap,
  swapCallbackError,
}: SwapButtonProps) {
  const { t } = useTranslation('swap')

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

  return (
    <StyledButton disabled={!!swapInputError || !!swapCallbackError} onClick={handleSwap} platformName={platformName}>
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
