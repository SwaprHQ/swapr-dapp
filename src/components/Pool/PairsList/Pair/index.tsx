import React from 'react'
import { Box } from 'rebass'
import { CurrencyAmount, Percent, Token } from '@swapr/sdk'
import { TYPE } from '../../../../theme'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { DarkCard } from '../../../Card'
import styled from 'styled-components'
import ApyBadge from '../../ApyBadge'
import { formatCurrencyAmount } from '../../../../utils'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'
import { StyledButtonDark } from '../../LiquidityMiningCampaignView/StakeCard'

const SizedCard = styled(DarkCard)`
  width: 100%;
  height: 80px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: 22px;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    height: initial;
    padding: 16px;
    height:128px;
  `}
`

const PositiveBadgeRoot = styled.div`
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1.5px solid ${props => props.theme.green2};
  border-radius: 4px;
  padding: 1px 2.5px;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    margin-left:auto;
  `}
`

const BadgeText = styled.div`
  font-weight: 700;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.04em;
  color: ${props => props.theme.green2};
`

const EllipsizedText = styled(TYPE.body)`
  overflow: hidden;
  text-overflow: ellipsis;
`

const TextWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 12px;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    width:auto;
    margin:0;
    justify-content: flex-start;
}


  `}
`

const BadgeWrapper = styled.div`
  align-self: flex-start;
  margin-left: auto;

  ${props => props.theme.mediaWidth.upToExtraSmall`
    align-self: center;
    margin-bottom:6px;
  `}
`

const RootFlex = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: row;
    display:contents;
    justify-content: auto;
  `}
`

const InnerLowerFlex = styled.div`
  display: flex;
  flex: 0;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex: 1;
    flex-direction:column;
    justify-content:space-between;
  `}
`

const MobileHidden = styled(Box)`
  display: flex;
  align-items: center;
  min-width: auto !important;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`
const DesktopHidden = styled(Box)`
  display: none;
  ${props => props.theme.mediaWidth.upToExtraSmall`
    display: block;
  `}
`

const TokenWrapper = styled.div`
  display: flex;
  width: max-content;
  grid-gap: 6px;
  align-items: center;
`

interface PairProps {
  token0?: Token
  token1?: Token
  apy: Percent
  usdLiquidity: CurrencyAmount
  usdLiquidityText?: string
  staked?: boolean
}

export default function Pair({ token0, token1, usdLiquidity, apy, staked, usdLiquidityText, ...rest }: PairProps) {
  return (
    <SizedCard selectable {...rest}>
      <RootFlex>
        <InnerLowerFlex>
          <DesktopHidden>
            <DoubleCurrencyLogo
              spaceBetween={-12}
              marginLeft={-23}
              top={-25}
              currency0={token0}
              currency1={token1}
              size={64}
            />
          </DesktopHidden>
          <MobileHidden>
            <DoubleCurrencyLogo spaceBetween={-12} currency0={token0} currency1={token1} size={45} />
          </MobileHidden>
          <TextWrapper>
            <TokenWrapper>
              <EllipsizedText color="white" lineHeight="19px" fontWeight="700" fontSize="16px" maxWidth="100%">
                {unwrappedToken(token0)?.symbol}/{unwrappedToken(token1)?.symbol}
              </EllipsizedText>
              <MobileHidden>
                {apy.greaterThan('0') && (
                  <BadgeWrapper>
                    <ApyBadge apy={apy} />
                  </BadgeWrapper>
                )}
              </MobileHidden>
            </TokenWrapper>
            <TokenWrapper>
              <TYPE.small width="max-content" fontSize="11px" color="text5" fontFamily="Fira Code">
                ${formatCurrencyAmount(usdLiquidity)} {usdLiquidityText?.toUpperCase() || 'LIQUIDITY'}
              </TYPE.small>
              <MobileHidden>
                {staked && (
                  <PositiveBadgeRoot>
                    <BadgeText>STAKING</BadgeText>
                  </PositiveBadgeRoot>
                )}
              </MobileHidden>
            </TokenWrapper>
          </TextWrapper>
        </InnerLowerFlex>
        <DesktopHidden>
          <TextWrapper>
            {apy.greaterThan('0') && (
              <BadgeWrapper>
                <ApyBadge apy={apy} />
              </BadgeWrapper>
            )}
            {staked && (
              <PositiveBadgeRoot>
                <BadgeText>STAKING</BadgeText>
              </PositiveBadgeRoot>
            )}
          </TextWrapper>
        </DesktopHidden>
      </RootFlex>
      <MobileHidden>
        <StyledButtonDark>Provide Liquidity</StyledButtonDark>
      </MobileHidden>
    </SizedCard>
  )
}
