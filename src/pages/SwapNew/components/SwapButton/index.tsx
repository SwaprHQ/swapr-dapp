import { Trade, ChainId } from '@swapr/sdk'

import { useTranslation } from 'react-i18next'

import { SWAP_INPUT_ERRORS } from '../../../../constants'
import { ROUTABLE_PLATFORM_STYLE, RoutablePlatformKeysByNetwork } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { WrapState, WrapType } from '../../../../hooks/useWrapCallback'
import { ConnectWalletButton } from './ConnectWalletButton'
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
}: SwapButtonProps) {
  const { t } = useTranslation('swap')
  const { account, chainId } = useActiveWeb3React()

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

  const routablePlatforms = chainId
    ? RoutablePlatformKeysByNetwork[chainId]
    : RoutablePlatformKeysByNetwork[ChainId.MAINNET]

  const platformName = trade?.platform.name

  if (!account) return <ConnectWalletButton />

  if (showWrap)
    return <WrapButton wrapInputError={wrapInputError} wrapState={wrapState} onWrap={onWrap} wrapType={wrapType} />
  return (
    <StyledButton disabled={loading || swapInputError ? true : false} onClick={handleSwap}>
      {(() => {
        if (loading) return <SwapButtonLabel light={true}>LOADING...</SwapButtonLabel>
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
