import { Currency } from '@swapr/sdk'

import { MouseoverTooltip } from '../../../../components/Tooltip'
import { useActiveWeb3React } from '../../../../hooks'
import { useNativeCurrency } from '../../../../hooks/useNativeCurrency'
import { wrappedCurrency } from '../../../../utils/wrappedCurrency'

export const CurrencySelectTooltip = ({ currency, children }: { currency: Currency; children: React.ReactNode }) => {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  const tokenSymbol = wrappedCurrency(nativeCurrency, chainId)?.symbol

  if (currency.symbol !== nativeCurrency.symbol || !chainId || !tokenSymbol) {
    return <>{children}</>
  }

  return (
    <MouseoverTooltip
      content={`Only available on ${tokenSymbol}-pairs. Use ${tokenSymbol} for limit orders.`}
      placement="top"
    >
      {children}
    </MouseoverTooltip>
  )
}
