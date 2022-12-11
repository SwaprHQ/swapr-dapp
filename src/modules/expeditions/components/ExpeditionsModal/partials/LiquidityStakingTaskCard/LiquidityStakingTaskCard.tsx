import { useCallback } from 'react'

import { ClaimTaskRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions, useExpeditionsTaskClaim } from '../../../../Expeditions.hooks'
import { computeFragmentState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function LiquidityStakingTaskCard() {
  const { tasks } = useExpeditions()
  const { claimTask, isClaiming } = useExpeditionsTaskClaim()

  const { liquidityStaking } = tasks

  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(liquidityStaking, isClaiming)

  const claim = useCallback(async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    await claimTask(ClaimTaskRequestTypeEnum.LiquidityStaking)
  }, [claimTask, isAvailableToClaim, isClaimed, isClaiming])

  return (
    <TaskCard
      button={buttonText}
      buttonDisabled={isClaimed || isClaiming || isIncomplete}
      claimed={isClaimed}
      onClick={claim}
      startDate={tasks.liquidityStaking.startDate}
      endDate={tasks.liquidityStaking.endDate}
      description="Get some fragments each week for staking at least $50 of liquidity on Swapr!"
      duration="Weekly"
      title="Stake Liquidity"
    />
  )
}
