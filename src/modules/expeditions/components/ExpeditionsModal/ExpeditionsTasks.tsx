import { DailyVisitTaskCard } from './partials/DailyVisitTaskCard'
import { LiquidityProvisionTaskCard } from './partials/LiquidityProvisionTaskCard'
import { LiquidityStakingTaskCard } from './partials/LiquidityStakingTaskCard'

export const ExpeditionsTasks = () => {
  return (
    <>
      <DailyVisitTaskCard />
      <LiquidityProvisionTaskCard />
      <LiquidityStakingTaskCard />
    </>
  )
}
