import { Trade } from '@swapr/sdk'

import { ROUTABLE_PLATFORM_STYLE } from '../../../../constants'
import { StyledButton, SwapButtonLabel, PlatformLogo } from './styles'

type SwapButtonProps = {
  trade?: Trade
  handleSwap: () => void
  swapCallbackError: string | null
}

export function SwapButton({ trade, handleSwap, swapCallbackError }: SwapButtonProps) {
  const platformName = trade?.platform.name

  return (
    <StyledButton disabled={!!swapCallbackError} onClick={handleSwap} platformName={platformName}>
      <SwapButtonLabel>Swap With</SwapButtonLabel>
      {platformName && (
        <>
          <PlatformLogo
            src={ROUTABLE_PLATFORM_STYLE[platformName!].logo}
            alt={ROUTABLE_PLATFORM_STYLE[platformName!].alt}
          />
          <SwapButtonLabel>{ROUTABLE_PLATFORM_STYLE[platformName!].name}</SwapButtonLabel>
        </>
      )}
    </StyledButton>
  )
}
