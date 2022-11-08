import { useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions } from '../../../../contexts/ExpeditionsContext'
import { computeFragmentState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function LiquidityStakingTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { tasks, setTasks, provider, setClaimedFragments } = useExpeditions()

  const { liquidityStaking } = tasks
  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(liquidityStaking, isClaiming)

  const claim = async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    setIsClaiming(true)

    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(ClaimRequestTypeEnum.LiquidityStaking)
      await ExpeditionsAPI.postExpeditionsClaim({
        body: {
          address,
          signature,
          type: ClaimRequestTypeEnum.LiquidityStaking,
        },
      })
      // Update local state
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
