import { Trade } from '@swapr/sdk'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import {
  ELEMENTS_BACKGROUND_SECONDARY,
  ELEMENTS_BORDER_SECONDARY,
  ELEMENTS_SPACING,
  BorderStyle,
} from '../../constants'
import { SwapInfoBasics } from './SwapInfoBasics'
import { SwapInfoDetailed } from './SwapInfoDetailed'

type SwapInfoProps = {
  loading: boolean
  allPlatformTrades?: (Trade | undefined)[]
  selectedTrade?: Trade
  outputCurrencySymbol?: string
}

export function SwapInfo({ loading, allPlatformTrades, selectedTrade, outputCurrencySymbol }: SwapInfoProps) {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  return (
    <Container
      initial={{ height: 0 }}
      animate={{
        height: 'auto',
      }}
    >
      <SwapInfoBasics
        selectedTrade={selectedTrade}
        allPlatformTrades={allPlatformTrades}
        showSwapInfoDetails={showSwapInfoDetails}
        toggleShowInfoDetails={() => setShowSwapInfoDetails(value => !value)}
      />

      <AnimatePresence>
        {showSwapInfoDetails && allPlatformTrades?.length !== 0 && (
          <SwapInfoDetailed
            loading={loading}
            allPlatformTrades={allPlatformTrades}
            selectedTrade={selectedTrade}
            outputCurrencySymbol={outputCurrencySymbol}
          />
        )}
      </AnimatePresence>
    </Container>
  )
}

// TODO: PULL OUT THE CONSTANTS

const Container = styled(motion.div)`
  padding: 9px 12px;
  ${BorderStyle}
  background: ${ELEMENTS_BACKGROUND_SECONDARY};
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  overflow: hidden;
  margin-bottom: ${ELEMENTS_SPACING};

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: ${ELEMENTS_BORDER_SECONDARY};
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
`
