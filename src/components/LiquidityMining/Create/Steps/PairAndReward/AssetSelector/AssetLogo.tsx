import { Token } from '@swapr/sdk'

import React from 'react'
import styled from 'styled-components'

import { ReactComponent as Cross } from '../../../../../../assets/svg/plusIcon.svg'
import { CampaignType } from '../../../../../../pages/LiquidityMining/Create'
import { CurrencyLogo } from '../../../../../CurrencyLogo'
import DoubleCurrencyLogo from '../../../../../DoubleLogo'

const StyledCurrencyLogo = styled(CurrencyLogo)`
  position: absolute;
  top: -31px;
`
const InsideCircle = styled.div<{ size: string }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  margin: 0 auto;
  /* BG/Dark/#3 */
  text-align: center;

  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%233E4259FF' stroke-width='1' stroke-dasharray='6%25%2c 8%25' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e");
  box-sizing: border-box;
  backdrop-filter: blur(12.3487px);

  border-radius: 219.679px;
`
const StyledSvg = styled.div`
  display: flex;
  align-items: center;

  height: 100%;
  svg {
    margin: 0 auto;
    display: block;
  }
`
interface AssetLogoProps {
  currency0?: Token | null
  currency1?: Token | null
  campaingType: CampaignType
}

export const Circle = styled.div<{ size: string; active: boolean; top?: string; left?: string }>`
  position: absolute;
  display: flex;
  align-items: center;
  text-align: center;
  margin: 0 auto;
  left: ${({ left }) => left && left}px;
  top: ${({ top }) => top && top}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: ${({ active }) => (active ? 'none' : '1px solid #2A2F42')};
  background: ${({ active }) =>
    active ? 'linear-gradient(135deg, rgba(118, 52, 255, 0.7) 16.33%, rgba(35, 0, 102, 0) 95.92%)' : '#3C38641A'};
  box-shadow: ${({ active }) =>
    active
      ? 'inset 5.17256px 8.62093px 25.8628px rgba(255, 255, 255, 0.16), inset 9.56367px 3.18789px 15.9394px rgba(255, 255, 255, 0.1);'
      : 'inset 0px 1.55659px 9.33954px rgba(165, 164, 255, 0.08),  inset 9.33954px 3.11318px 15.5659px rgba(143, 141, 255, 0.1);'};

  filter: drop-shadow(18px 0px 60px rgba(175, 135, 255, 0.3));
  backdrop-filter: ${({ active }) => (active ? 'blur(22.4144px)' : 'blur(14px)')};
  background-color: ${({ active }) => active && '#000000f5'};
  border-radius: 255.031px;
`
const DoubleIconWrapper = styled.div`
  position: absolute;
  top: -24px;
  left: 59px;
`
interface CrossProps {
  campaignType: CampaignType
}
const CrossIcon = ({ campaignType }: CrossProps) => {
  if (campaignType === CampaignType.TOKEN) {
    return (
      <Circle size={'100'} top="-27" left="31" active={false}>
        <InsideCircle size={'80'}>
          <StyledSvg>
            <Cross />
          </StyledSvg>
        </InsideCircle>
      </Circle>
    )
  } else {
    return (
      <DoubleIconWrapper>
        <Circle size={'84'} active={false} left="-38" style={{ left: '-38px' }}>
          <InsideCircle size={'65'}>
            <StyledSvg>
              <Cross />
            </StyledSvg>
          </InsideCircle>
        </Circle>
        <Circle size={'84'} active={false} left="0">
          <InsideCircle size={'65'}>
            <StyledSvg>
              <Cross />
            </StyledSvg>
          </InsideCircle>
        </Circle>
      </DoubleIconWrapper>
    )
  }
}
export const AssetLogo = ({ currency0, currency1, campaingType }: AssetLogoProps) => {
  if (currency0 && currency1) {
    return (
      <DoubleCurrencyLogo
        style={{ position: 'absolute' }}
        size={84}
        top={-26}
        currency0={currency0}
        currency1={currency1}
      />
    )
  } else if (currency0) {
    return <StyledCurrencyLogo size="98px" currency={currency0} />
  }
  return <CrossIcon campaignType={campaingType} />
}
