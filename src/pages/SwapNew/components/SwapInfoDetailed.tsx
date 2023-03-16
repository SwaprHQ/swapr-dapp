import { Trade, TradeType } from '@swapr/sdk'

import { motion } from 'framer-motion'
import { useCallback, useContext } from 'react'
import styled from 'styled-components'

import { SwapContext } from '../../Swap/SwapBox/SwapContext'
import { SwapDexInfoItem } from './SwapDexInfoItem'

type SwapInfoDetailedProps = {
  loading: boolean
  allPlatformTrades?: (Trade | undefined)[]
  selectedTrade?: Trade
}

export function SwapInfoDetailed({ loading, allPlatformTrades, selectedTrade }: SwapInfoDetailedProps) {
  const { setPlatformOverride } = useContext(SwapContext)

  const handleSelectedTradeOverride = useCallback(
    (platformName: string) => {
      const newTrade = allPlatformTrades?.find(trade => trade?.platform.name === platformName)
      if (!newTrade) return
      setPlatformOverride(newTrade.platform)
    },
    [allPlatformTrades, setPlatformOverride]
  )

  return (
    <Container
      initial={{ height: 0 }}
      animate={{
        height: 'auto',
        transition: {
          duration: 0.2,
        },
      }}
      exit={{
        height: 0,
        transition: {
          duration: 0.1,
        },
      }}
    >
      {!loading &&
        allPlatformTrades?.length !== 0 &&
        allPlatformTrades?.map(trade => {
          if (!trade) return null

          return (
            <SwapDexInfoItem
              isSelected={selectedTrade?.platform.name === trade.platform.name}
              trade={trade}
              onClick={() => handleSelectedTradeOverride(trade.platform.name)}
            />
          )
        })}
    </Container>
  )
}

const Container = styled(motion.div)`
  margin-top: 9px;
`
