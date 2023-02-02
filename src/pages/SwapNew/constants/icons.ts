import { ReactComponent as BALLogoSVG } from '../../../assets/swapbox/token-logo-bal.svg'
import { ReactComponent as BATLogoSVG } from '../../../assets/swapbox/token-logo-bat.svg'
import { ReactComponent as DAILogoSVG } from '../../../assets/swapbox/token-logo-dai.svg'
import { ReactComponent as DXDLogoSVG } from '../../../assets/swapbox/token-logo-dxd.svg'
import { ReactComponent as ETHLogoSVG } from '../../../assets/swapbox/token-logo-eth.svg'
import { ReactComponent as SWPRLogoSVG } from '../../../assets/swapbox/token-logo-swpr.svg'
import { ReactComponent as USDCLogoSVG } from '../../../assets/swapbox/token-logo-usdc.svg'
import { ReactComponent as USDTLogoSVG } from '../../../assets/swapbox/token-logo-usdt.svg'

export enum CurrencySymbol {
  BAL = 'BAL',
  BAT = 'BAT',
  DAI = 'DAI',
  DXD = 'DXD',
  ETH = 'ETH',
  SWPR = 'SWPR',
  USDC = 'USDC',
  USDT = 'USDT',
}

export const currencies = {
  [CurrencySymbol.BAL]: BALLogoSVG,
  [CurrencySymbol.BAT]: BATLogoSVG,
  [CurrencySymbol.DAI]: DAILogoSVG,
  [CurrencySymbol.DXD]: DXDLogoSVG,
  [CurrencySymbol.ETH]: ETHLogoSVG,
  [CurrencySymbol.SWPR]: SWPRLogoSVG,
  [CurrencySymbol.USDC]: USDCLogoSVG,
  [CurrencySymbol.USDT]: USDTLogoSVG,
}
