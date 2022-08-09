import { ChainId } from '@swapr/sdk'

import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ROUTABLE_PLATFORM_LOGO } from '../../../../constants'
import { ExternalLink } from '../../../../theme/components'
import { getExplorerLink } from '../../../../utils'
import { useStylingTradeBackground } from './Trade.hooks'
import { formatDate } from './Trade.utils'

const TradeWrapper = styled(ExternalLink)`
  display: flex;
  align-items: center;
  // justify-content: space-between;
  font-size: 10px;
  margin: 0.15rem;
  & > div {
    padding: 0.15rem;
    width: calc(100% / 3);
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  const style = useStylingTradeBackground({ amountUSDNumber: Number(amountUSD), isSell: isSell })

  return (
    <TradeWrapper style={style} href={getExplorerLink(chainId ?? ChainId.MAINNET, transactionId, 'transaction')}>
      <Flex alignItems={'center'}>
        {ROUTABLE_PLATFORM_LOGO[logoKey]}
        <Text sx={{ marginLeft: '10px', overflowX: 'hidden', textOverflow: 'ellipsis' }}>{amountIn}</Text>
      </Flex>
      <Text sx={{ textAlign: 'left' }}>{amountOut}</Text>
      <Text sx={{ textAlign: 'right', textTransform: 'uppercase', fontSize: '10px' }}>
        {formatDate(Number(timestamp) * 1000)}
      </Text>
    </TradeWrapper>
  )
}
