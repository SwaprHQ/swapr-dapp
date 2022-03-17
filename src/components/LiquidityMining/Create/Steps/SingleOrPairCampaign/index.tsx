import React, { useCallback } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'

import { AutoColumn } from '../../../../Column'
import { AutoRow } from '../../../../Row'
import { Card as StyleCar } from '../../../styleds'

const Card = styled(StyleCar)<{ active?: boolean }>`
  width: 218px;
  height: 138px;
  justify-content: end;
  opacity: ${props => (!props.selectable || props.active ? '1' : '0.4')};
  cursor: pointer;
  ::before {
    border: 1px solid;
    backdrop-filter: blur(20px);
    border-image-source: ${props =>
      props.active ? 'linear-gradient(114.28deg, rgba(36, 23, 137, 0.2) 0%, #282167 91.9%)' : 'transperent'};
    background-blend-mode: Lighten;
    background: ${props =>
      props.active
        ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),linear-gradient(114.19deg, rgba(90, 12, 255, 0.8) -9%, rgba(17, 8, 35, 0) 113.1%)'
        : 'transperent'};
  }

  display: flex;
  align-items: center;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    width: 100%;
  `}
`

const CardText = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Diamond = styled.div<{ size: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;

  background: linear-gradient(135deg, rgba(118, 52, 255, 0.7) 16.33%, rgba(35, 0, 102, 0) 95.92%);
  box-shadow: inset 5.17256px 8.62093px 25.8628px rgba(255, 255, 255, 0.16),
    inset 9.56367px 3.18789px 15.9394px rgba(255, 255, 255, 0.1);
  filter: drop-shadow(18px 0px 60px rgba(175, 135, 255, 0.3));
  backdrop-filter: blur(22.4144px);

  border-radius: 255.031px;
`

interface SingleOrPairCampaignProps {
  singleReward: CampaignType
  onChange: (newValue: CampaignType) => void
}

export default function SingleOrPairCampaign({ singleReward, onChange }: SingleOrPairCampaignProps) {
  const handleRewardClick = useCallback(
    event => {
      console.log(event)
      onChange(event)
    },
    [onChange]
  )

  return (
    <AutoRow gap="35px">
      <Card active={singleReward === CampaignType.TOKEN} onClick={() => handleRewardClick(CampaignType.TOKEN)}>
        <Diamond size={'98'} style={{ top: '21px', left: '-27px' }} />
        <AutoColumn>
          <CardText>Single</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </AutoColumn>
      </Card>
      <Card onClick={() => handleRewardClick(CampaignType.PAIR)} active={singleReward === CampaignType.PAIR}>
        <Diamond style={{ top: '26px', left: '-38px' }} size={'84'} />
        <Diamond style={{ top: '26px', left: '0px' }} size={'84'} />
        <AutoColumn>
          <CardText>LP</CardText>
          <CardText>Token</CardText>
          <CardText>Staking</CardText>
        </AutoColumn>
      </Card>
    </AutoRow>
  )
}
