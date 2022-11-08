import { DailyVisit, WeeklyFragments } from '../api/generated'

export function computeFragmentState(rewards: WeeklyFragments, isClaiming: boolean) {
  const isClaimed = rewards.claimedFragments > 0
  const isAvailableToClaim = rewards.claimableFragments > 0
  const isIncomplete = !isClaimed && !isAvailableToClaim

  let buttonText = ''

  if (isClaiming) {
    buttonText = 'Claiming...'
  } else if (isClaimed) {
    buttonText = 'Claimed'
  } else if (isAvailableToClaim) {
    buttonText = `Claim ${rewards.claimableFragments} Fragments`
  } else if (isIncomplete) {
    buttonText = 'TASK NOT YET COMPLETED'
  }

  return {
    isClaimed,
    isAvailableToClaim,
    isIncomplete,
    buttonText,
  }
}

export function computeDailyState(dailyVisit: DailyVisit, isClaiming: boolean) {
  const isClaimed = dailyVisit.lastVisit >= dailyVisit.startDate && dailyVisit.lastVisit <= dailyVisit.endDate

  let buttonText = ''

  if (isClaiming) {
    buttonText = 'Claiming...'
  } else if (isClaimed) {
    buttonText = 'Claimed'
  } else {
    buttonText = 'Claim'
  }

  return { isClaimed, buttonText }
}
