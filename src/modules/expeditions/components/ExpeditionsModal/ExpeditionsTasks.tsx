import { DailySwapsTaskCard } from './partials/DailySwapsTaskCard/DailySwapsTaskCard'
import { DailyVisitTaskCard } from './partials/DailyVisitTaskCard'
import { LiquidityProvisionTaskCard } from './partials/LiquidityProvisionTaskCard'
import { LiquidityStakingTaskCard } from './partials/LiquidityStakingTaskCard'

export const ExpeditionsTasks = () => {
  return (
    <>
      <DailyVisitTaskCard />
      <DailySwapsTaskCard />
      <LiquidityProvisionTaskCard />
      <LiquidityStakingTaskCard />
    </>
  )
}
