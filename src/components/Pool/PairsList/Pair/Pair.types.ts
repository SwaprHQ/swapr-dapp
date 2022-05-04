import { CurrencyAmount, Percent, Token } from '@swapr/sdk'

export interface PairProps {
  token0?: Token
  token1?: Token
  apy: Percent
  usdLiquidity: CurrencyAmount
  pairOrStakeAddress?: string
  containsKpiToken?: boolean
  hasFarming?: boolean
  isSingleSidedStakingCampaign?: boolean
  dayLiquidity?: string
}
