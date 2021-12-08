import React, { useEffect, useState } from 'react'
import { Box } from 'rebass'
import { JSBI, CurrencyAmount, Percent, Token } from '@swapr/sdk'
import { TYPE } from '../../../../theme'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { DarkCard } from '../../../Card'
import styled from 'styled-components'
import { formatCurrencyAmount } from '../../../../utils'
import { AutoColumn } from '../../../Column'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'
import { ReactComponent as CarrotLogo } from '../../../../assets/svg/carrot.svg'
import { ReactComponent as ClockLogo } from '../../../../assets/svg/clock.svg'
import { ReactComponent as LockIcon } from '../../../../assets/svg/lock.svg'
import { MouseoverTooltip } from '../../../Tooltip'

const SizedCard = styled(DarkCard)`
  width: 16.8em;
  height: 9em;
  padding: 16px;
  ${props => props.theme.mediaWidth.upToMedium`
    width: 100%;
  `}
  ${props => props.theme.mediaWidth.upToExtraSmall`
    height: initial;
    padding: 22px 16px;
  `}
`

const Countdown = styled.div`
  padding: 3px 5px;
  display: flex;
`

const CountdownText = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  font-family: 'Fira Code';
  position: static;
  color: #8780BF;
  opacity: 0.8;
  letter-spacing: 0.02em;
`

const KpiBadge = styled.div`
  height: 16px;
  border: solid 1.5px #f2994a;
  color: #f2994a;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  line-height: 9px;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  padding: 0 4px;
`

const StyledClockLogo = styled(ClockLogo)`
  margin-right: 4px;
`

const StyledLockIcon = styled(LockIcon)`
  margin-right: 4px;
`

const StyledCarrotLogo = styled(CarrotLogo)`
  margin-right: 4px;
  > path {
    fill: #f2994a;
  }
`

const EllipsizedText = styled(TYPE.body)`
  overflow: hidden;
  text-overflow: ellipsis;
  color: #C0BAF7;
`

const StatusTextBox = styled(TYPE.body)`
  border-style: solid;
  border-radius: 4px;
  width: fit-content;
  padding: 1px 2px 1px 2px;
  border-width: 2px;
  font-family='Montserrat';
`

const PercentageTextBox = styled(TYPE.body)`
  color: #F02E51;
  weight: 600;
  font-size: 10px !important;
  font-family='Montserrat' !important;
  display: 'inline-block';
  float: right;
  padding-top: 2px;
`

const TextWrapper = styled(Box)`
  order: 1;
  width: 100%;
  margin-top: 20px;
`

const BadgeWrapper = styled.div`
  align-self: flex-start;
  margin-left: auto;
  display: contents;

  ${props => props.theme.mediaWidth.upToExtraSmall`
    align-self: center;
  `}
`

const PercentageBar = styled.div`
  width: 100%;
  height: 3px;
  background: #3E4259;
  opacity: 0.5;
  border-radius: 6px;
  margin-top: 7px;
`

const Loaded = styled(TYPE.body)`
  background: #F02E51;
  height: 100%;
`

const CountdownFlex = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: row-reverse;
    justify-content: auto;
  `}
`

const InnerUpperFlex = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: row-reverse;
    align-items: center;
  `}
`

const InnerLowerFlex = styled.div`
  display: flex;
  flex: 0;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex: 1;
  `}
`

const MobileHidden = styled(Box)`
  display: block;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

const DesktopHidden = styled(Box)`
  display: none;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: block;
  `}
`

const STATUS = {
    ACTIVE: { key: "ACTIVE", color: "#0E9F6E" },
    UPCOMING: { key: "UPCOMING", color: "#F2994A" },
    ENDED: { key: "ENDED", color: "#F02E51" },
};

const updateCountdown = (start: number) => {
  if (!start) { return "-" };
  let now = Date.now();

  let diff = now - start;

  let days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  let minutes = Math.floor((diff / 1000 / 60) % 60);

  return `${days}D ${hours}H ${minutes}M`;
};

interface Campaign {
  staked: any
  stakingCap: any
  startsAt: any // this attribute can be a bigint, a Number or a string
  endsAt: any   // can be a bigint, a Number or a string
}

interface PairProps {
  token0?: Token
  token1?: Token
  apy: Percent
  usdLiquidity: CurrencyAmount
  usdLiquidityText?: string
  staked?: boolean
  containsKpiToken?: boolean
  campaign?: Campaign
}

export default function Pair({
  token0,
  token1,
  usdLiquidity,
  apy,
  staked,
  containsKpiToken,
  usdLiquidityText,
  campaign,
  ...rest
}: PairProps) {
  const [countdown, setCountdown] = useState(updateCountdown(campaign?.startsAt));

  var percentage;
  
  if (JSBI.greaterThanOrEqual(campaign?.stakingCap.raw, campaign?.staked.raw)) {
    percentage = new Percent(campaign?.staked.raw, campaign?.stakingCap.raw)
  }
  const now = Date.now();
  var status;

  if (campaign?.endsAt < now) {
    status = STATUS.ENDED;
  } else if (now > campaign?.startsAt) {
    status = STATUS.UPCOMING;
  } else if (now > campaign?.startsAt && campaign?.endsAt > now) {
    status = STATUS.ACTIVE;
  };

  useEffect(() => {
    setTimeout(() => {
      if (campaign?.startsAt) { setCountdown(updateCountdown(campaign?.startsAt)) };
    }, 1000*60);
  });

  return (
    <SizedCard selectable {...rest}>
      <CountdownFlex>
        <InnerUpperFlex>
          <MobileHidden>
            <DoubleCurrencyLogo currency0={token0} currency1={token1} size={34} />
          </MobileHidden>
          <Box>
            <AutoColumn justify="flex-end" gap="6px">
              {apy.greaterThan('0') && status?.key && (
                <BadgeWrapper>
                  <Countdown>
                    <StyledClockLogo />
                    <CountdownText>{ countdown }</CountdownText>
                  </Countdown>
                  <StatusTextBox color={status.color} fontSize="9px" fontWeight="bold">
                    {status.key}
                  </StatusTextBox>
                </BadgeWrapper>
              )}
              {containsKpiToken && (
                <MouseoverTooltip content="Rewards at least a Carrot KPI token">
                  <KpiBadge>
                    <StyledCarrotLogo />
                    CARROT
                  </KpiBadge>
                </MouseoverTooltip>
              )}
            </AutoColumn>
          </Box>
        </InnerUpperFlex>
        <InnerLowerFlex>
          <DesktopHidden mr="8px" minWidth="auto">
            <DoubleCurrencyLogo currency0={token0} currency1={token1} size={34} />
          </DesktopHidden>
          <TextWrapper>
            <Box>
              <EllipsizedText fontFamily="Montserrat" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="100%">
                {unwrappedToken(token0)?.symbol}/{unwrappedToken(token1)?.symbol}
              </EllipsizedText>
            </Box>
            <Box>
              <EllipsizedText fontFamily="Fira Mono" fontWeight="bold" fontSize="18px" color="#EBE9F8" letterSpacing="0.02em">
                {apy.toFixed(2)}%  APY
              </EllipsizedText>
              <EllipsizedText fontFamily="Fira Mono" fontWeight="600" fontSize="10px" color="##8780BF">
                { status?.key !== "ACTIVE" && (<StyledLockIcon/>) }
                ${formatCurrencyAmount(usdLiquidity, 2)} {status?.key === "ACTIVE" ? 'STAKED' : 'LOCKED'}
                { percentage && (
                  <PercentageTextBox>{ percentage.toFixed(2) }%</PercentageTextBox>
                ) }
              </EllipsizedText>
              { percentage && (
                <PercentageBar><Loaded width={percentage.toFixed(2) + '%'} /></PercentageBar>
                )}
            </Box>
          </TextWrapper>
        </InnerLowerFlex>
      </CountdownFlex>
    </SizedCard>
  )
}
