import { useTranslation } from 'react-i18next'

import { SWAP_INPUT_ERRORS } from '../../../../constants'
import { StyledButton, SwapButtonLabel } from './styles'

type ErrorButtonProps = {
  swapInputError: number
  amountInCurrencySymbol?: string
}

export function ErrorButton({ swapInputError, amountInCurrencySymbol }: ErrorButtonProps) {
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

  return (
    <StyledButton disabled={true}>
      <SwapButtonLabel light={true}>{SWAP_INPUT_ERRORS_MESSAGE[swapInputError]}</SwapButtonLabel>
    </StyledButton>
  )
}
