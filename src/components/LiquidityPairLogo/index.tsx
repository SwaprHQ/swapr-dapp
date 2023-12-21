import React from 'react'
import styled from 'styled-components'

interface LiquidityPairLogoProps {
  height?: number
  leftLogoSrc: string
  leftLogoWidth?: number
  rightLogoSrc: string
  rightLogoWidth?: number
}

export const LiquidityPairLogo = ({
  height = 96,
  leftLogoWidth = 96,
  leftLogoSrc,
  rightLogoWidth = 32,
  rightLogoSrc,
}: LiquidityPairLogoProps) => {
  return (
    <TokenPairWrapper height={height} leftLogoWidth={leftLogoWidth} rightLogoWidth={rightLogoWidth}>
      <TokenPairLeftLogo leftLogoWidth={leftLogoWidth} src={leftLogoSrc} />
      <TokenPairRightLogo rightLogoWidth={rightLogoWidth} src={rightLogoSrc} />
    </TokenPairWrapper>
  )
}

const TokenPairWrapper = styled.div<{ height?: number; leftLogoWidth?: number; rightLogoWidth?: number }>`
  position: relative;
  height: ${({ height }) => height}px;
  width: ${({ leftLogoWidth, rightLogoWidth }) => {
    if (!leftLogoWidth || !rightLogoWidth) return '108px'

    const rightLogoOverlapWidth = rightLogoWidth * 0.375

    return `${leftLogoWidth + rightLogoOverlapWidth}px`
  }};
`

const TokenPairLeftLogo = styled.img<{ leftLogoWidth?: number }>`
  position: absolute;
  left: 0;
  width: ${({ leftLogoWidth }) => leftLogoWidth}px;
`

const TokenPairRightLogo = styled.img<{ rightLogoWidth?: number }>`
  position: absolute;
  right: 0;
  z-index: 2;
  width: ${({ rightLogoWidth }) => rightLogoWidth}px;
`
