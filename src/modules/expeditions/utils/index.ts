import { WeeklyFragments } from '../api/generated'

export function computeFragmentState(rewards: WeeklyFragments) {
  const isClaimed = rewards.claimedFragments > 0
  const isAvailableToClaim = rewards.claimableFragments > 0
  const isIncomplete = !isClaimed && !isAvailableToClaim

  return {
    isClaimed,
    isAvailableToClaim,
    isIncomplete,
  }
}
