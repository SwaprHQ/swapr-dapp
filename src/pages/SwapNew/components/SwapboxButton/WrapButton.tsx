import { WrapState, WrapType } from '../../../../hooks/useWrapCallback'
import { StyledButton, SwapButtonLabel } from './styles'

type WrapButtonProps = {
  wrapInputError: string | undefined
  wrapState?: WrapState | undefined
  onWrap: (() => Promise<void>) | undefined
  wrapType: WrapType
}

export function WrapButton({ wrapInputError, wrapState, onWrap, wrapType }: WrapButtonProps) {
  const getWrapButtonLabel = () => {
    if (wrapState === WrapState.PENDING) {
      return wrapType === WrapType.WRAP ? 'Wrapping' : 'Unwrapping'
    } else {
      return wrapType === WrapType.WRAP ? 'Wrap' : 'Unwrap'
    }
  }

  return (
    <StyledButton disabled={Boolean(wrapInputError) || wrapState === WrapState.PENDING} onClick={onWrap}>
      <SwapButtonLabel>{wrapInputError ?? getWrapButtonLabel()}</SwapButtonLabel>
    </StyledButton>
  )
}
