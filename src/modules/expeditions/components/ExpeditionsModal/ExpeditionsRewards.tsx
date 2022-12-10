import { useMemo } from 'react'

import uriToHttp from '../../../../utils/uriToHttp'
import { useExpeditions } from '../../contexts/ExpeditionsContext'
import { RewardCard, RewardCardProps } from '../ExpeditionsCards'

export const ExpeditionsRewards = () => {
  const { rewards: rewardsRaw, claimedFragments } = useExpeditions()

  // const claimReward = async (nftAddress: string, tokenId: string) => {
  //   // create signature
  //   // send request
  //   // send tx to contract
  //   // change local state
  //   console.log('under construction')
  // }

  const rewards = useMemo(() => {
    const map = rewardsRaw.map<RewardCardProps>(({ description, imageURI, name, rarity, requiredFragments }) => {
      const hasEnoughFragments = claimedFragments >= requiredFragments
      const claimed = false // temp

      // const expired todo - need to fetch campaign redeem end date from BE
      const buttonDisabled = claimed || !hasEnoughFragments
      const buttonText = claimed ? 'Claimed' : hasEnoughFragments ? 'Claim' : 'Not enough fragments'

      return {
        description,
        title: name,
        rarity,
        requiredFragments,
        imageUrl: uriToHttp(imageURI)[0],
        buttonText,
        claimed,
        expired: false,
        onClick: () => console.log('under construction'),
        buttonDisabled,
      }
    })

    return map
  }, [rewardsRaw, claimedFragments])

  return (
    <>
      {rewards.map((props, index) => (
        <RewardCard key={index} {...props} />
      ))}
    </>
  )
}
