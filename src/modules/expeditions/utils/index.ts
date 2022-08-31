import { WeeklyFragmentRewards } from '../api'

export function computeFragmentState(rewards: WeeklyFragmentRewards) {
  const isClaimed = rewards.claimedFragments > 0
  const isAvailableToClaim = rewards.claimableFragments > 0
  const isIncomplete = !isClaimed && !isAvailableToClaim

  return {
    isClaimed,
    isAvailableToClaim,
    isIncomplete,
  }
}
