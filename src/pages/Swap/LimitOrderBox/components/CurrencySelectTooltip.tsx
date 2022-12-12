import { ChainId, Currency, ETHER, XDAI } from '@swapr/sdk'

import { MouseoverTooltip } from '../../../../components/Tooltip'
import { useActiveWeb3React } from '../../../../hooks'
import { wrappedCurrency } from '../../../../utils/wrappedCurrency'

const wrappedCurrencySymbols: Record<Extract<ChainId, ChainId.MAINNET | ChainId.GNOSIS>, string | undefined> = {
  [ChainId.MAINNET]: wrappedCurrency(ETHER, ChainId.MAINNET)?.symbol,
  [ChainId.GNOSIS]: wrappedCurrency(XDAI, ChainId.GNOSIS)?.symbol,
}

export const CurrencySelectTooltip = ({ currency, children }: { currency: Currency; children: React.ReactNode }) => {
  const { chainId } = useActiveWeb3React()

  if (
    (currency.symbol !== ETHER.symbol && currency.symbol !== XDAI.symbol) ||
    (chainId !== ChainId.MAINNET && chainId !== ChainId.GNOSIS)
  ) {
    return <>{children}</>
  }

  const tokenSymbol = wrappedCurrencySymbols[chainId]

  return (
    <MouseoverTooltip
      content={`Only available on ${tokenSymbol}-pairs. Use ${tokenSymbol} for limit orders.`}
      placement="top"
    >
      {children}
    </MouseoverTooltip>
  )
}
