import styled from 'styled-components'

import GnoTokenLogoDark from '../../assets/images/gnosis-chain-logo-dark.svg'
import SwaprTokenLogoDarkWithRing from '../../assets/images/swapr-logo-dark-with-ring.svg'
import { LIQUIDITY_V3_LINK } from '../../constants'
import { LiquidityPairLogo } from '../LiquidityPairLogo'

export const LiquidityV3Popup = () => {
  return (
    <FlexContainer onClick={() => document.location.assign(LIQUIDITY_V3_LINK)}>
      <LiquidityPairLogo leftLogoSrc={SwaprTokenLogoDarkWithRing} rightLogoSrc={GnoTokenLogoDark} />
      <LiquidityV3Text>Provide concentrated liquidity in Gnosis Chain.</LiquidityV3Text>
    </FlexContainer>
  )
}

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const LiquidityV3Text = styled.div`
  font-weight: 600;
  font-size: 20px;
  color: #fff;
  line-height: 28px;
  letter-spacing: -0.26px;
  width: 65%;
  margin-left: 15px;
`
