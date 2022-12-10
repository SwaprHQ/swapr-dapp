import { useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimTaskRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions } from '../../../../contexts/ExpeditionsContext'
import { computeDailyState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function DailyVisitTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { tasks, provider, setTasks, setClaimedFragments } = useExpeditions()

  const { dailyVisit } = tasks
  const { isClaimed, buttonText } = computeDailyState(dailyVisit, isClaiming)

  const claim = async () => {
    if (isClaimed || isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(ClaimTaskRequestTypeEnum.DailyVisit)
      await ExpeditionsAPI.postExpeditionsClaimtask({
        body: {
          address,
          signature,
          type: ClaimTaskRequestTypeEnum.DailyVisit,
        },
      })

      const { claimedFragments, tasks } = await ExpeditionsAPI.getExpeditionsProgress({
        address,
      })

      // Update local state
      setTasks(tasks)
      setClaimedFragments(claimedFragments)
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  const overwriteStatus = tasks.dailyVisit.lastVisit.getTime() > 0 ? undefined : 'active'

  return (
    <TaskCard
      buttonText={buttonText}
      buttonDisabled={isClaimed || isClaiming}
      claimed={isClaimed}
      onClick={claim}
      startDate={tasks.dailyVisit.lastVisit}
      endDate={tasks.dailyVisit.nextVisit}
      description="Make a daily visit to unlock entire new feeling of Swapr Expeditions. Really!"
      duration="Daily"
      title="Daily Visit"
      overwriteStatus={overwriteStatus}
    />
  )
}
