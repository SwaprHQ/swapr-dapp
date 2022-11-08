import { useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimRequestTypeEnum } from '../../../../api/generated'
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
      const signature = await provider.getSigner().signMessage(ClaimRequestTypeEnum.DailyVisit)
      await ExpeditionsAPI.postExpeditionsClaim({
        body: {
          address,
          signature,
          type: ClaimRequestTypeEnum.DailyVisit,
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

  return (
    <TaskCard
      buttonText={buttonText}
      buttonDisabled={isClaimed || isClaiming}
      claimed={isClaimed}
      onClick={claim}
      startDate={tasks.dailyVisit.startDate}
      endDate={tasks.dailyVisit.endDate}
      description="Make a daily visit to unlock entire new feeling of Swapr Expeditions. Really!"
      duration="Daily"
      title="Daily Visit"
    />
  )
}
