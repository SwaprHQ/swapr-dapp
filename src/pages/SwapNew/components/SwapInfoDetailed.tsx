import { Trade, TradeType } from '@swapr/sdk'

import { motion } from 'framer-motion'
import styled from 'styled-components'

import { SwapDexInfoItem } from './SwapDexInfoItem'

type SwapInfoDetailedProps = {
  loading: boolean
  allPlatformTrades?: (Trade | undefined)[]
}

export function SwapInfoDetailed({ loading, allPlatformTrades }: SwapInfoDetailedProps) {
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

          return <SwapDexInfoItem trade={trade} />
        })}
    </Container>
  )
}

const Container = styled(motion.div)`
  margin-top: 9px;
`
