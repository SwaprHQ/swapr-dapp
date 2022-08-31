import { useContext, useState } from 'react'

import { ExpeditionsAPI } from '../../../../api'
import { ClaimWeeklyFragmentsResponseDTOTypeEnum } from '../../../../api/generated'
import { signatureMessageByType } from '../../../../constants'
import { ExpeditionsContext } from '../../../../contexts/ExpeditionsContext'
import { computeFragmentState } from '../../../../utils'
import { TaskCard as TaskCardBase, TaskCardProps } from '../../../ExpeditionsCard'

const TaskCard = (props: Omit<TaskCardProps, 'description' | 'duration' | 'title'>) => (
  <TaskCardBase
    description="Get some fragments each week for providing at least $50 of liquidity on Swapr!"
    duration="Weekly"
    title="Provide Liquidity"
    {...props}
  />
)

export function LiquidityProvisionTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { rewards, isLoading, provider, setRewards } = useContext(ExpeditionsContext)

  if (isLoading) {
    return <TaskCard buttonText={'Loading...'} status={'upcoming'} />
  }

  const { liquidityProvision } = rewards
  const { isAvailableToClaim, isClaimed, isIncomplete } = computeFragmentState(liquidityProvision)

  const claimFrgments = async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(signatureMessageByType.LIQUIDITY_PROVISION)
      const claimFrgmentsResponse = await ExpeditionsAPI.postExpeditionsWeeklyfragmentsClaim({
        body: {
          address,
          signature,
          type: ClaimWeeklyFragmentsResponseDTOTypeEnum.Provision,
        },
      })

      // Update local state
      setRewards({
        liquidityProvision: {
          ...liquidityProvision,
          claimedFragments: claimFrgmentsResponse.claimedFragments,
        },
        liquidityStaking: rewards.liquidityStaking,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  let buttonText: string = ''

  if (isClaimed) {
    buttonText = 'Claimed'
  } else if (isAvailableToClaim) {
    buttonText = `Claim ${liquidityProvision.claimableFragments} Fragments`
  } else if (isIncomplete) {
    buttonText = 'TASK NOT YET COMPLETED'
  }

  return (
    <TaskCard
      buttonText={buttonText}
      status={rewards.liquidityStaking.claimableFragments > 0 ? 'active' : 'upcoming'}
      butttonDisabled={isIncomplete}
      onClick={claimFrgments}
    />
  )
}
