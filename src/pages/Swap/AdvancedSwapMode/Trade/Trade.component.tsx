import { ChainId } from '@swapr/sdk'

import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ROUTABLE_PLATFORM_LOGO } from '../../../../constants'
import { ExternalLink } from '../../../../theme/components'
import { getExplorerLink } from '../../../../utils'
import { AdvancedModeDetailsItems } from '../AdvancedSwapMode.styles'
import { useStylingTradeBackground } from './Trade.hooks'
import { formatDate } from './Trade.utils'

const TradeWrapper = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  margin-top: 10px;

  & div {
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 10px;
  }

  ${AdvancedModeDetailsItems}
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
  price,
}: {
  chainId?: ChainId
  transactionId: string
  amountIn: string
  amountOut: string
  amountUSD: string
  price?: string
  timestamp: string
  logoKey: string
  isSell: boolean
}) => {
  const style = useStylingTradeBackground({ amountUSDNumber: Number(amountUSD), isSell })

  return (
    <TradeWrapper style={style} href={getExplorerLink(chainId ?? ChainId.MAINNET, transactionId, 'transaction')}>
      <Flex alignItems="center">
        {ROUTABLE_PLATFORM_LOGO[logoKey]}
        <Text sx={{ marginLeft: '5px' }}>{amountIn}</Text>
      </Flex>
      <Text>{amountOut}</Text>
      {price && <Text>{price}</Text>}
      <Text sx={{ textTransform: 'uppercase', textAlign: 'right' }}>{formatDate(Number(timestamp) * 1000)}</Text>
    </TradeWrapper>
  )
}
