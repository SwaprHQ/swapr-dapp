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
  justify-content: space-between;
  font-size: 10px;
  margin-top: 10px;

  & > div {
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 25%;
    margin-left: 10px;
  }
  & > div:nth-child(2) {
    margin-left: 25px;
  }
  & > div:nth-child(3) {
    margin-left: 0px;
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
  const style = useStylingTradeBackground({ amountUSDNumber: Number(amountUSD), isSell })

  return (
    <TradeWrapper style={style} href={getExplorerLink(chainId ?? ChainId.MAINNET, transactionId, 'transaction')}>
      <Flex alignItems="center">
        {ROUTABLE_PLATFORM_LOGO[logoKey]}
        <Text sx={{ marginLeft: '5px' }}>{amountIn}</Text>
      </Flex>
      <Text>{amountOut}</Text>
      <Text sx={{ textTransform: 'uppercase', fontSize: '8px', textAlign: 'right' }}>
        {formatDate(Number(timestamp) * 1000)}
      </Text>
    </TradeWrapper>
  )
}
