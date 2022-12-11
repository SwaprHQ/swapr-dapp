import { useMemo } from 'react'

import uriToHttp from '../../../../utils/uriToHttp'
import { useExpeditions } from '../../Expeditions.hooks'
import { RewardCard, RewardCardProps } from '../ExpeditionsCards'

export const ExpeditionsRewards = () => {
  const { rewards: rewardsRaw, claimedFragments, redeemEndDate } = useExpeditions()

  // const claimReward = async (nftAddress: string, tokenId: string) => {
  //   // create signature
  //   // send request
  //   // send tx to contract
  //   // change local state
  //   console.log('under construction')
  // }

  const rewards = useMemo(() => {
    if (!rewardsRaw || !redeemEndDate) {
      return []
    }

    const map = rewardsRaw.map<RewardCardProps>(({ description, imageURI, name, rarity, requiredFragments }) => {
      const hasEnoughFragments = claimedFragments >= requiredFragments
      const claimed = false // temp

      // const expired todo - need to fetch campaign redeem end date from BE
      const expired = new Date().getTime() > redeemEndDate?.getTime()
      const buttonDisabled = claimed || !hasEnoughFragments
      const buttonText = claimed ? 'Owned' : hasEnoughFragments ? 'Claim' : 'Not enough fragments'

      return {
        description,
        title: name,
        rarity,
        requiredFragments,
        imageUrl: uriToHttp(imageURI)[0],
        buttonText,
        claimed,
        expired,
        onClick: () => console.log('under construction'),
        buttonDisabled,
      }
    })

    return map
  }, [rewardsRaw, redeemEndDate, claimedFragments])

  return (
    <>
      {rewards.map((props, index) => (
        <RewardCard key={index} {...props} />
      ))}
    </>
  )
}
