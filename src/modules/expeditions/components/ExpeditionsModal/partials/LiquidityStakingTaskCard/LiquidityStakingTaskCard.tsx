import { useContext, useState } from 'react'

import { claimUserWeeklyFragments } from '../../../../api'
import { WeeklyFragmentType } from '../../../../constants'
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
  const { rewards, isLoading, provider } = useContext(ExpeditionsContext)

  if (isLoading) {
    return <TaskCard buttonText={'Loading...'} status={'upcoming'} />
  }

  const { liquidityStaking } = rewards
  const { isAvailableToClaim, isClaimed, isIncomplete } = computeFragmentState(liquidityStaking)

  const claimFrgments = async () => {
    if (!isClaimed && !isAvailableToClaim && !isClaiming) {
      return
    }

    setIsClaiming(true)
    try {
      const address = await provider.getSigner().getAddress()
      const signature = await provider.getSigner().signMessage('Claim Swapr weekly liquidity staking fragments')
      await claimUserWeeklyFragments({ address, signature, type: WeeklyFragmentType.LIQUIDITY_STAKING })
      // Update local state
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(true)
    }
  }

  let buttonText: string = ''

  if (isClaiming) {
    buttonText = 'Claiming...'
  } else if (isClaimed) {
    buttonText = 'Claimed'
  } else if (isAvailableToClaim) {
    buttonText = `Claim ${liquidityStaking.claimableFragments} Fragments`
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