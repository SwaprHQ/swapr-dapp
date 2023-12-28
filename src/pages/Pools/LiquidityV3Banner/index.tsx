import styled from 'styled-components'

import GnoTokenLogoDark from '../../../assets/images/gnosis-chain-logo-dark.svg'
import LiquidityV3BannerBg from '../../../assets/images/liquidity-v3-banner-bg.svg'
import SwaprTokenLogoDarkWithRing from '../../../assets/images/swapr-logo-dark-with-ring.svg'
import { LiquidityPairLogo } from '../../../components/LiquidityPairLogo'
import { LIQUIDITY_V3_LINK } from '../../../constants'
import { breakpoints } from '../../../utils/theme'

const FlexLinkContainer = styled.a`
  align-items: center;
  background: url(${LiquidityV3BannerBg});
  background-position-x: center;
  border-radius: 16px;
  display: flex;
  padding: 20px 24px;
  width: 100%;

  @media screen and (max-width: ${breakpoints.md}) {
    padding: 10px 12px;
  }
`

const LiquidityBannerText = styled.p`
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.24px;
  margin-left: 23px;

  @media screen and (max-width: ${breakpoints.md}) {
    font-size: 16px;
    width: 75%;
  }
`

export default function LiquidityV3Banner() {
  return (
    <FlexLinkContainer href={LIQUIDITY_V3_LINK} target="_blank">
      <LiquidityPairLogo
        leftLogoSrc={SwaprTokenLogoDarkWithRing}
        leftLogoWidth={56}
        height={56}
        rightLogoSrc={GnoTokenLogoDark}
        rightLogoWidth={24}
      />
      <LiquidityBannerText>Swapr concentrated liquidity AMM launching soon</LiquidityBannerText>
    </FlexLinkContainer>
  )
}
