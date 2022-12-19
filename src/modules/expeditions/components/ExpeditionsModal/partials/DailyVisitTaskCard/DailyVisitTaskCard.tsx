import { useCallback } from 'react'

import { ClaimTaskRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions, useExpeditionsTaskClaim } from '../../../../Expeditions.hooks'
import { computeDailyState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function DailyVisitTaskCard() {
  const { tasks } = useExpeditions()
  const { claimTask, isClaiming } = useExpeditionsTaskClaim()

  const { dailyVisit } = tasks
  const { isClaimed, buttonText } = computeDailyState(dailyVisit, isClaiming)

  const claim = useCallback(async () => {
    if (isClaimed || isClaiming) {
      return
    }

    await claimTask(ClaimTaskRequestTypeEnum.DailyVisit)
  }, [claimTask, isClaimed, isClaiming])

  const overwriteStatus = tasks.dailyVisit.lastVisit.getTime() > 0 ? undefined : 'active'

  return (
    <TaskCard
      button={buttonText}
      buttonDisabled={isClaimed || isClaiming}
      claimed={isClaimed}
      onClick={claim}
      startDate={tasks.dailyVisit.lastVisit}
      endDate={tasks.dailyVisit.nextVisit}
      description="Get some fragments each day for visiting Swapr!"
      duration="Daily"
      title="Daily Visit"
      overwriteStatus={overwriteStatus}
    />
  )
}
