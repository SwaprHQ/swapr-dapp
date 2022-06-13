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
  position: absolute;
  right: 42px;
  text-align: start;
  color: ${props => (props.active ? props.theme.text3 : props.theme.text5)} !important;
`
const StyledAutoRow = styled(AutoRow)`
  ${props => props.theme.mediaWidth.upToSmall`
    margin:0;
  `}
`
interface SingleOrPairCampaignProps {
  singleReward: CampaignType
  onChange: (newValue: CampaignType) => void
}
interface CircleProps {
  pairOrToken: boolean
  active: boolean
}
export function AdjustableDiamondSize({ pairOrToken, active }: CircleProps) {
  if (pairOrToken) return <Circle active={active} size={'98'} top="21" left="-27" />
  else
    return (
      <>
        <Circle active={active} top="26" left="-38" size={'84'} />
        <Circle active={active} top="26" left="0" size={'84'} />
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
    <StyledAutoRow gap="35px">
      <SmoothGradientCard
        selectable
        width={'218px'}
        height={'138px'}
        active={singleReward === CampaignType.TOKEN}
        onClick={() => handleRewardClick(CampaignType.TOKEN)}
        data-testid="single-token-staking-switch"
      >
        <AdjustableDiamondSize pairOrToken={true} active={singleReward === CampaignType.TOKEN} />
        <StyledAutoColumn active={singleReward === CampaignType.TOKEN}>
          <CardText>Single</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </StyledAutoColumn>
      </SmoothGradientCard>
      <SmoothGradientCard
        selectable
        width={'218px'}
        height={'138px'}
        onClick={() => handleRewardClick(CampaignType.PAIR)}
        active={singleReward === CampaignType.PAIR}
        data-testid="lp-token-staking-switch"
      >
        <AdjustableDiamondSize pairOrToken={false} active={singleReward === CampaignType.PAIR} />
        <StyledAutoColumn active={singleReward === CampaignType.PAIR}>
          <CardText>LP</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </StyledAutoColumn>
      </SmoothGradientCard>
    </StyledAutoRow>
  )
}
