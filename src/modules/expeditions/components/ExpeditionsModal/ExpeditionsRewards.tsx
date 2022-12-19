import { useMemo } from 'react'

import uriToHttp from '../../../../utils/uriToHttp'
import { useExpeditions, useExpeditionsRewardClaim } from '../../Expeditions.hooks'
import { RewardCard, RewardCardProps } from '../ExpeditionsCards'

export const ExpeditionsRewards = () => {
  const { rewards: rewardsRaw, claimedFragments, redeemEndDate } = useExpeditions()

  const { claimReward, claimedTokenId, changeNetwork, needsToChangeNetwork } = useExpeditionsRewardClaim()

  const rewards = useMemo(() => {
    if (!rewardsRaw || !redeemEndDate) {
      return []
    }

    const map = rewardsRaw.map<RewardCardProps>(
      ({ description, imageURI, name, rarity, requiredFragments, owned, tokenId }) => {
        const hasEnoughFragments = claimedFragments >= requiredFragments
        const claimed = owned
        const expired = new Date().getTime() > redeemEndDate?.getTime()
        const buttonDisabled = claimed || !hasEnoughFragments || claimedTokenId === tokenId
        const buttonText =
          claimedTokenId === tokenId
            ? 'Claiming...'
            : claimed
            ? 'Owned'
            : hasEnoughFragments
            ? needsToChangeNetwork
              ? 'Switch to Goerli/ArbOne'
              : 'Claim'
            : 'Not enough fragments'

        return {
          description,
          title: name,
          rarity,
          requiredFragments,
          imageUrl: uriToHttp(imageURI)[0],
          buttonText,
          claimed,
          expired,
          onClick: async () => (needsToChangeNetwork ? await changeNetwork() : await claimReward(tokenId)),
          buttonDisabled,
        }
      }
    )

    return map
  }, [rewardsRaw, redeemEndDate, claimedFragments, claimedTokenId, claimReward])

  return (
    <>
      {rewards.map((props, index) => (
        <RewardCard key={index} {...props} />
      ))}
    </>
  )
}
