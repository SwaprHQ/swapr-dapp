import { useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimTaskRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions } from '../../../../contexts/ExpeditionsContext'
import { computeFragmentState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function LiquidityProvisionTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { tasks, provider, setTasks, setClaimedFragments } = useExpeditions()

  const { liquidityProvision } = tasks
  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(
    liquidityProvision,
    isClaiming
  )

  const claim = async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(ClaimTaskRequestTypeEnum.LiquidityProvision)
      await ExpeditionsAPI.postExpeditionsClaimtask({
        body: {
          address,
          signature,
          type: ClaimTaskRequestTypeEnum.LiquidityProvision,
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
      startDate={tasks.liquidityProvision.startDate}
      endDate={tasks.liquidityProvision.endDate}
      description="Get some fragments each week for providing at least $50 of liquidity on Swapr!"
      duration="Weekly"
      title="Provide Liquidity"
    />
  )
}
