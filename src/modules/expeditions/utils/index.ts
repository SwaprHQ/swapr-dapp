import { WeeklyFragmentsRewards } from '../api/generated'

export function computeFragmentState(rewards: WeeklyFragmentsRewards) {
  const isClaimed = rewards.claimedFragments > 0
  const isAvailableToClaim = rewards.claimableFragments > 0
  const isIncomplete = !isClaimed && !isAvailableToClaim

  return {
    isClaimed,
    isAvailableToClaim,
    isIncomplete,
  }
}
