import styled from 'styled-components'

import GnoTokenLogoDark from '../../assets/images/gnosis-chain-logo-dark.svg'
import SwaprTokenLogoDarkWithRing from '../../assets/images/swapr-logo-dark-with-ring.svg'
import { LIQUIDITY_V3_LINK } from '../../constants'

export const LiquidityV3Popup = () => {
  return (
    <FlexContainer onClick={() => document.location.assign(LIQUIDITY_V3_LINK)}>
      <LeftColumnContainer>
        <TokenPairWrapper>
          <TokenPairLeftLogo src={SwaprTokenLogoDarkWithRing} />
          <TokenPairRightLogo src={GnoTokenLogoDark} />
        </TokenPairWrapper>
      </LeftColumnContainer>
      <LiquidityV3Text>Provide liquidity on a range in Gnosis Chain.</LiquidityV3Text>
    </FlexContainer>
  )
}

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const LeftColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const LiquidityV3Text = styled.div`
  font-weight: 600;
  font-size: 26px;
  color: #fff;
  line-height: 28px;
  letter-spacing: -0.26px;
  width: 65%;
  margin-left: 15px;
`
const TokenPairWrapper = styled.div`
  position: relative;
  height: 96px;
  width: 108px;
`

const TokenPairLeftLogo = styled.img`
  position: absolute;
  left: 0;
  width: 96px;
`

const TokenPairRightLogo = styled.img`
  position: absolute;
  right: 0;
  z-index: 2;
  width: 32px;
`
