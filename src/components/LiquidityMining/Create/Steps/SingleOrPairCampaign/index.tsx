import React, { useCallback } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'

import { AutoRow } from '../../../../Row'
import { SmoothGradientCard } from '../../../styleds'
import { Circle } from '../PairAndReward/AssetSelector/AssetLogo'

const CardText = styled(Text)`
  font-weight: 600;
  font-size: 13px;
  line-height: 22px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
`
const StyledAutoColumn = styled(Flex)<{ active: boolean }>`
  flex-direction: column;
  position: relative;
  left: -25px;
  text-align: start;
  color: ${props => (props.active ? props.theme.text3 : props.theme.text5)} !important;
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
        <StyledAutoColumn active={singleReward === CampaignType.TOKEN}>
          <CardText>Single</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </StyledAutoColumn>
      </SmoothGradientCard>
      <SmoothGradientCard
        width={'218px'}
        height={'138px'}
        onClick={() => handleRewardClick(CampaignType.PAIR)}
        active={singleReward === CampaignType.PAIR}
      >
        {adjustableDiamondSize(false, singleReward === CampaignType.PAIR)}
        <StyledAutoColumn active={singleReward === CampaignType.PAIR}>
          <CardText>LP</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </StyledAutoColumn>
      </SmoothGradientCard>
    </AutoRow>
  )
}
