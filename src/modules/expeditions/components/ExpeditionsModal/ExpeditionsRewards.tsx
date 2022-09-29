import { RewardCard, RewardCardProps } from '../ExpeditionsCards'
import { capitalize, RarityTags } from '../ExpeditionsCards/ExpeditionsTags'

const rewards: RewardCardProps[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map(
  (rarity, index) => ({
    buttonText: index === 0 ? 'Expired' : index === 1 ? 'Claimed' : 'Claim',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tempor, ante nec consectetur vulputate, eros nisi placerat neque, ut volutpat diam tellus ut sem.`,
    imageUrl: 'https://picsum.photos/200',
    rarity: rarity as RarityTags,
    title: `${capitalize(rarity)} NFT`,
    claimed: index === 1,
    expired: index === 0,
    buttonDisabled: index < 2,
    onClick: () => {},
    requiredFragments: (index + 1) * 1000,
  })
)

export const ExpeditionsRewards = () => {
  return (
    <>
      {rewards.map((props, index) => (
        <RewardCard key={index} {...props} />
      ))}
    </>
  )
}
