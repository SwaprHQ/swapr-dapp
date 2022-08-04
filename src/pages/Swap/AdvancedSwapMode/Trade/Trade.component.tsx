import { ChainId } from '@swapr/sdk'

import { formatDistance, subDays } from 'date-fns'
import { CSSProperties, useLayoutEffect, useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ROUTABLE_PLATFORM_LOGO } from '../../../../constants'
import { ExternalLink } from '../../../../theme/components'
import { getExplorerLink } from '../../../../utils'

enum SizeOfTrade {
  MIN = 1000,
  MAX = 100000,
}

const TradeWrapper = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin: 5px;
  padding: 5px;
  & > div {
    flex: 1;
  }
`

export const Trade = ({
  amountIn,
  amountOut,
  timestamp,
  isSell,
  amountUSD,
  logoKey,
  transactionId,
  chainId,
}: {
  chainId?: ChainId
  transactionId: string
  amountIn: string
  amountOut: string
  amountUSD?: string
  timestamp: string
  logoKey: string
  isSell?: boolean
}) => {
  const [style, setStyle] = useState<CSSProperties>()

  const formatDate = (timestamp: number) => {
    try {
      return formatDistance(subDays(new Date(timestamp), 3), new Date(), {
        addSuffix: true,
      })
    } catch {
      return '-'
    }
  }

  useLayoutEffect(() => {
    const color = isSell ? '#f02e51' : '#0e9f6e'
    const background = isSell ? 'rgba(45, 24, 40, 0.5)' : 'rgb(20, 33, 36, 0.5)'
    const amountUSDNumber = Number(amountUSD)

    if (amountUSDNumber < SizeOfTrade.MIN) {
      setStyle({
        background: `transparent`,
        color,
      })
      return
    }

    if (amountUSDNumber > SizeOfTrade.MAX) {
      setStyle({
        background,
        color,
      })
      return
    }

    const width = (100 - amountUSDNumber / SizeOfTrade.MIN).toFixed(0).toString()

    setStyle({
      background: `linear-gradient(to right, transparent ${width}%, ${background} ${width}% 100%)`,
      color,
    })
  }, [amountUSD, isSell])

  return (
    <TradeWrapper style={style} href={getExplorerLink(chainId ?? ChainId.MAINNET, transactionId, 'transaction')}>
      <Flex>
        {ROUTABLE_PLATFORM_LOGO[logoKey]}
        <Text sx={{ marginLeft: '10px' }}>{amountIn}</Text>
      </Flex>
      <Text sx={{ textAlign: 'center' }}>{amountOut}</Text>
      <Text sx={{ textAlign: 'right', textTransform: 'uppercase', fontSize: '10px' }}>
        {formatDate(Number(timestamp) * 1000)}
      </Text>
    </TradeWrapper>
  )
}
