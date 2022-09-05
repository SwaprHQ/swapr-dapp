import { useContext, useState } from 'react'

import { Loader } from '../../../../../../components/Loader'
import { ExpeditionsAPI } from '../../../../api'
import { ClaimWeeklyFragmentsTypeEnum } from '../../../../api/generated'
import { signatureMessageByType } from '../../../../constants'
import { ExpeditionsContext } from '../../../../contexts/ExpeditionsContext'
import { computeFragmentState } from '../../../../utils'
import { TaskCard as TaskCardBase, TaskCardProps } from '../../../ExpeditionsCard'

const TaskCard = (props: Omit<TaskCardProps, 'description' | 'duration' | 'title'>) => (
  <TaskCardBase
    description="Get some fragments each week for staking at least $50 of liquidity on Swapr!"
    duration="Weekly"
    title="Stake Liquidity"
    {...props}
  />
)

export function LiquidityStakingTaskCard() {
  const [isClaiming, setIsClaiming] = useState(false)
  const { rewards, setRewards, isLoading, provider } = useContext(ExpeditionsContext)

  if (isLoading) {
    return <TaskCard buttonText={<Loader style={{ width: '97.25px' }} />} buttonDisabled status="loading" />
  }

  const { liquidityStaking } = rewards
  const { isAvailableToClaim, isClaimed, isIncomplete, buttonText } = computeFragmentState(liquidityStaking, isClaiming)

  const claimFrgments = async () => {
    if (isClaimed || !isAvailableToClaim || isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage(signatureMessageByType.LIQUIDITY_STAKING)
      const claimFrgmentsResponse = await ExpeditionsAPI.postExpeditionsWeeklyfragmentsClaim({
        body: {
          address,
          signature,
          type: ClaimWeeklyFragmentsTypeEnum.Staking,
        },
      })
      // Update local state
      setRewards({
        liquidityProvision: rewards.liquidityProvision,
        liquidityStaking: {
          ...liquidityStaking,
          claimedFragments: claimFrgmentsResponse.claimedFragments,
        },
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
