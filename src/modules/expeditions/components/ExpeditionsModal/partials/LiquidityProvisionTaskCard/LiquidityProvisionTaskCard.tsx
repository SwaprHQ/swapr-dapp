import { useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimRequestTypeEnum } from '../../../../api/generated'
import { useExpeditions } from '../../../../contexts/ExpeditionsContext'
import { computeFragmentState } from '../../../../utils'
import { TaskCard } from '../../../ExpeditionsCards'

export function LiquidityProvisionTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { tasks, provider, setTasks } = useExpeditions()

  const { liquidityProvision } = tasks
  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(
    liquidityProvision,
    isClaiming
  )

  const claimFragments = async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(ClaimRequestTypeEnum.LiquidityProvision)
      const claimFragmentsResponse = await ExpeditionsAPI.postExpeditionsClaim({
        body: {
          address,
          signature,
          type: ClaimRequestTypeEnum.LiquidityProvision,
        },
      })

      // Update local state
      setTasks({
        liquidityProvision: {
          ...liquidityProvision,
          claimedFragments: claimFragmentsResponse.claimedFragments,
        },
        liquidityStaking: tasks.liquidityStaking,
        dailyVisit: tasks.dailyVisit,
      })
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
      onClick={claimFragments}
      startDate={tasks.liquidityProvision.startDate}
      endDate={tasks.liquidityProvision.endDate}
      description="Get some fragments each week for providing at least $50 of liquidity on Swapr!"
      duration="Weekly"
      title="Provide Liquidity"
    />
  )
}
