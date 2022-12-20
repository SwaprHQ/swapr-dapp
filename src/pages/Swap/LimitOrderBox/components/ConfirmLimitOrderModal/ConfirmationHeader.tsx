import { CurrencyAmount, TokenAmount } from '@swapr/sdk'

export type HeaderData = {
  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
  isFallbackFiatValueInput: boolean
  isFallbackFiatValueOutput: boolean
  buyToken: TokenAmount
  sellToken: TokenAmount
}

export const ConfirmationHeader = ({
  fiatValueInput,
  fiatValueOutput,
  isFallbackFiatValueInput,
  isFallbackFiatValueOutput,
  buyToken,
  sellToken,
}: HeaderData) => {
  const fiatInput = fiatValueInput && isFallbackFiatValueInput && fiatValueInput.toFixed(2, { groupSeparator: ',' })
  const fiatOutput = fiatValueOutput && isFallbackFiatValueOutput && fiatValueOutput.toFixed(2, { groupSeparator: ',' })

  return (
    <div>
      <div>{sellToken.currency.symbol}</div>
      <div>{fiatInput}$</div>
      <div>{buyToken.currency.symbol}</div>
      <div>{fiatOutput}$</div>
    </div>
  )
}
