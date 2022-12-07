import { MouseoverTooltip } from '../../../../components/Tooltip'

export const CurrencySelectTooltip = ({ children }: { children: React.ReactNode }) => (
  <MouseoverTooltip content="Only available on WETH-pairs. Use WETH for limit orders." placement="top">
    {children}
  </MouseoverTooltip>
)
