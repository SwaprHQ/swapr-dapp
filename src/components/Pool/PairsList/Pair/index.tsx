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
import { AddSWPRToMetamaskButton } from '../../../Button'

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
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(14, 159, 110, 0.1);
  border-radius: 4px;
  padding: 0 4px;
`

const BadgeText = styled.div`
  font-weight: 600;
  font-size: 9px;
  line-height: 11px;
  letter-spacing: 0.02em;
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
    grid-gap:6px;
    justify-content: flex-start;
}


  `}
`

const BadgeWrapper = styled.div`
  align-self: flex-start;
  margin-left: auto;

  ${props => props.theme.mediaWidth.upToExtraSmall`
    align-self: center;
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

const AddSWPRToMetamaskButtonWraper = styled(AddSWPRToMetamaskButton)`
  display: flex;
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
            <DoubleCurrencyLogo top={-25} right={22} currency0={token0} currency1={token1} size={64} />
          </DesktopHidden>
          <MobileHidden>
            <DoubleCurrencyLogo currency0={token0} currency1={token1} size={34} />
          </MobileHidden>
          <TextWrapper>
            <Box>
              <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="100%">
                {unwrappedToken(token0)?.symbol}/{unwrappedToken(token1)?.symbol}
              </EllipsizedText>
            </Box>
            <Box>
              <TYPE.small width="max-content" fontSize="11px" color="text5">
                ${formatCurrencyAmount(usdLiquidity)} {usdLiquidityText?.toUpperCase() || 'LIQUIDITY'}
              </TYPE.small>
            </Box>
          </TextWrapper>
        </InnerLowerFlex>
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
      </RootFlex>
      <MobileHidden>
        <AddSWPRToMetamaskButtonWraper>Provide Liquidity</AddSWPRToMetamaskButtonWraper>
      </MobileHidden>
    </SizedCard>
  )
}
