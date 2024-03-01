import { ReactNode } from 'react'
import styled from 'styled-components'

import LinesImage from '../../assets/images/lines.svg'

export const SpaceBg = ({ children, isAdvancedTradeMode }: { children: ReactNode; isAdvancedTradeMode: boolean }) => (
  <StyledHero id="liquidity-hero" className="hero-active" isAdvancedTradeMode={isAdvancedTradeMode}>
    <AppBodyContainer>{children}</AppBodyContainer>
  </StyledHero>
)

const AppBodyContainer = styled.section`
  padding-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
`

const StyledHero = styled.div<{ isAdvancedTradeMode: boolean }>`
  background-image: url('${LinesImage}');
  background-repeat: no-repeat;
  background-position: top center;
  width: 100%;
  min-height: calc(100vh - 218px);
`
