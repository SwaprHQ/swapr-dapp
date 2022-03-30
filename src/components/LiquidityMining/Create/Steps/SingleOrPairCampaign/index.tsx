import React, { useCallback } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'

import { AutoColumn } from '../../../../Column'
import { AutoRow } from '../../../../Row'
import { SmoothGradientCard } from '../../../styleds'
import { Circle } from '../PairAndReward/AssetSelector/AssetLogo'

const CardText = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

interface SingleOrPairCampaignProps {
  singleReward: CampaignType
  onChange: (newValue: CampaignType) => void
}

export const adjustableDiamondSize = (pairOrToken: boolean, active: boolean) => {
  if (pairOrToken) return <Circle active={active} size={'98'} style={{ top: '21px', left: '-27px' }} />
  else
    return (
      <>
        <Circle active={active} style={{ top: '26px', left: '-38px' }} size={'84'} />
        <Circle active={active} style={{ top: '26px', left: '0px' }} size={'84'} />
      </>
    )
}

export default function SingleOrPairCampaign({ singleReward, onChange }: SingleOrPairCampaignProps) {
  const handleRewardClick = useCallback(
    event => {
      onChange(event)
    },
    [onChange]
  )

  return (
    <AutoRow gap="35px">
      <SmoothGradientCard
        width={'218px'}
        height={'138px'}
        active={singleReward === CampaignType.TOKEN}
        onClick={() => handleRewardClick(CampaignType.TOKEN)}
      >
        {adjustableDiamondSize(true, singleReward === CampaignType.TOKEN)}
        <AutoColumn>
          <CardText>Single</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </AutoColumn>
      </SmoothGradientCard>
      <SmoothGradientCard
        width={'218px'}
        height={'138px'}
        onClick={() => handleRewardClick(CampaignType.PAIR)}
        active={singleReward === CampaignType.PAIR}
      >
        {adjustableDiamondSize(false, singleReward === CampaignType.PAIR)}
        <AutoColumn>
          <CardText>LP</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </AutoColumn>
      </SmoothGradientCard>
    </AutoRow>
  )
}
