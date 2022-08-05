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
  const style = useStylingTradeBackground({ amountUSDNumber: Number(amountUSD), isSell: isSell })

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
