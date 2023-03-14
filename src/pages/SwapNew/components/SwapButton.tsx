import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReactComponent as CowSVG } from '../../../assets/swapbox/dex-logo-cow.svg'
import { SWAP_INPUT_ERRORS } from '../../../constants'
import { useIsExpertMode } from '../../../state/user/hooks'
import { getSwapButtonActiveColor, getSwapButtonHoverColor, TEXT_COLOR_PRIMARY } from '../constants'
import { FontFamily } from './styles'

const COW_SWAP_COLOR = 'linear-gradient(93.39deg, #2b00a4 -8.9%, #d67b5a 114.08%)'

type SwapButtonProps = {
  platformName?: string
  swapInputError?: number
  priceImpactSeverity: number
  loading: boolean
  amountInCurrencySymbol?: string
}

export function SwapButton({ swapInputError, loading, amountInCurrencySymbol }: SwapButtonProps) {
  const { t } = useTranslation('swap')
  const isExpertMode = useIsExpertMode()

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

  return (
    <StyledButton>
      {(() => {
        if (loading) return <SwapButtonLabel>LOADING...</SwapButtonLabel>
        if (swapInputError) return <SwapButtonLabel>{SWAP_INPUT_ERRORS_MESSAGE[swapInputError]}</SwapButtonLabel>

        return (
          <>
            <SwapButtonLabel>Swap With</SwapButtonLabel>
            <CowSVG />
            <SwapButtonLabel>Cow</SwapButtonLabel>
          </>
        )
      })()}
    </StyledButton>
  )
}

const StyledButton = styled.button`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: ${COW_SWAP_COLOR};
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    background: ${getSwapButtonHoverColor(COW_SWAP_COLOR)};
  }

  &:active {
    background: ${getSwapButtonActiveColor(COW_SWAP_COLOR)};
  }
`

const SwapButtonLabel = styled.p`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${TEXT_COLOR_PRIMARY};
`
