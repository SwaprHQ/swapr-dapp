import styled from 'styled-components'

import GnoTokenLogoDark from '../../../assets/images/gnosis-chain-logo-dark.svg'
import LiquidityV3BannerBg from '../../../assets/images/liquidity-v3-banner-bg.svg'
import SwaprTokenLogoDarkWithRing from '../../../assets/images/swapr-logo-dark-with-ring.svg'
import { LiquidityPairLogo } from '../../../components/LiquidityPairLogo'
import { LIQUIDITY_V3_LINK } from '../../../constants'

const FlexContainer = styled.div`
  align-items: center;
  background: url(${LiquidityV3BannerBg});
  background-position-x: center;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  height: 96px;
  padding: 20px 24px;
  width: 100%;
`

const LiquidityBannerText = styled.p`
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.24px;
  margin-left: 23px;
  width: 60%;
`

export default function LiquidityV3Banner() {
  return (
    <FlexContainer onClick={() => document.location.assign(LIQUIDITY_V3_LINK)}>
      <LiquidityPairLogo
        leftLogoSrc={SwaprTokenLogoDarkWithRing}
        leftLogoWidth={56}
        height={56}
        rightLogoSrc={GnoTokenLogoDark}
        rightLogoWidth={24}
      />
      <LiquidityBannerText>Pick your range when providing liquidity, only in Gnosis chain</LiquidityBannerText>
    </FlexContainer>
  )
}
