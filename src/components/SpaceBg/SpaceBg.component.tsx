import React, { FC, ReactNode } from 'react'
import { StyledHero, AppBodyContainer } from './SpaceBg.styles'

export const SpaceBg: FC<{ children: ReactNode }> = ({ children }) => (
  <StyledHero id="liquidity-hero" className="hero-active">
    <div className="inner-hero">
      <AppBodyContainer>{children}</AppBodyContainer>
      <div className="hero-background">
        <div className="hero-image hero-image-right"></div>
        <div className="hero-image hero-image-left"></div>
      </div>
    </div>
  </StyledHero>
)
