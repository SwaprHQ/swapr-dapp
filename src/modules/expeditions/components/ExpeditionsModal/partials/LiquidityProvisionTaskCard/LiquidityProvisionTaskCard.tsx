import { useCallback } from 'react'

import { ClaimTaskRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions, useExpeditionsTaskClaim } from '../../../../Expeditions.hooks'
import { computeFragmentState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function LiquidityProvisionTaskCard() {
  const { tasks } = useExpeditions()
  const { claimTask, isClaiming } = useExpeditionsTaskClaim()

  const { liquidityProvision } = tasks

  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(
    liquidityProvision,
    isClaiming
  )

  const claim = useCallback(async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    await claimTask(ClaimTaskRequestTypeEnum.LiquidityProvision)
  }, [claimTask, isAvailableToClaim, isClaimed, isClaiming])

  return (
    <TaskCard
      button={buttonText}
      buttonDisabled={isClaimed || isClaiming || isIncomplete}
      claimed={isClaimed}
      onClick={claim}
      startDate={tasks.liquidityProvision.startDate}
      endDate={tasks.liquidityProvision.endDate}
      description="Get some fragments each week for providing at least $50 of liquidity on Swapr!"
      duration="Weekly"
      title="Provide Liquidity"
    />
  )
}
