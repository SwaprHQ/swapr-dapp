import { useState } from 'react'

import { Loader } from '../../../../../../components/Loader'
import { ExpeditionsAPI } from '../../../../api'
import { ClaimWeeklyFragmentsTypeEnum } from '../../../../api/generated'
import { signatureMessageByType } from '../../../../constants'
import { useExpeditions } from '../../../../contexts/ExpeditionsContext'
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
  const { rewards, isLoading, provider, setRewards } = useExpeditions()

  if (isLoading) {
    return <TaskCard buttonText={<Loader style={{ width: '97.25px' }} />} buttonDisabled status="loading" />
  }

  const { liquidityProvision } = rewards
  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(
    liquidityProvision,
    isClaiming
  )

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
          type: ClaimWeeklyFragmentsTypeEnum.Provision,
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

  return (
    <TaskCard
      buttonText={buttonText}
      status={'active'}
      buttonDisabled={isClaimed || isClaiming || isIncomplete}
      claimed={isClaimed}
      onClick={claimFrgments}
    />
  )
}
