import { DateTime } from 'luxon'
import { Box, Flex } from 'rebass'

import { getExplorerLink } from '../../../utils'
import { formatNumber } from '../../../utils/formatNumber'
import { getNetworkInfo } from '../../../utils/networksList'
import {
  CustomLinkIcon,
  GridCard,
  NetworkLink,
  NetworkName,
  Status,
  TokenDetails,
  TransactionDetails,
  TypeDetails,
} from '../Account.styles'
import { type BridgeTransaction } from '../Account.types'
import { TokenIcon } from '../TokenIcon'

interface BridgeTransactionRowProps {
  transaction: BridgeTransaction
  showBackgroundStatus: boolean
}

export function BridgeTransactionRow({ transaction, showBackgroundStatus }: BridgeTransactionRowProps) {
  const { type, status, sellToken, buyToken, confirmedTime, logs, bridgeId } = transaction

  const fromNetwork = sellToken.chainId ? getNetworkInfo(Number(sellToken.chainId)) : undefined
  const toNetwork = buyToken?.chainId ? getNetworkInfo(Number(buyToken?.chainId)) : undefined

  const fromLink = getExplorerLink(logs[0]?.chainId, logs[0]?.txHash, 'transaction', bridgeId)
  const toLink =
    bridgeId === 'socket'
      ? logs[0] && logs[1] && getExplorerLink(logs[0].chainId, logs[0].txHash, 'transaction', bridgeId)
      : logs[1] && getExplorerLink(logs[1].chainId, logs[1].txHash, 'transaction', bridgeId)

  return (
    <GridCard status={showBackgroundStatus ? status.toUpperCase() : undefined}>
      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={sellToken.symbol} address={sellToken.tokenAddress} chainId={sellToken.chainId} />
            <Flex flexDirection="column">
              <Box>{formatNumber(sellToken.value, false)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{sellToken.symbol}</Box>
            </Flex>
          </Flex>
          <Box sx={{ mt: 1 }}>
            <NetworkLink href={fromLink} rel="noopener noreferrer" target="_blank">
              <CustomLinkIcon size={12} />
              {fromNetwork?.name}
            </NetworkLink>
          </Box>
        </Flex>
      </TokenDetails>

      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={buyToken.symbol} address={buyToken.tokenAddress} chainId={buyToken.chainId} />
            <Flex flexDirection="column">
              <Box>{formatNumber(buyToken.value, false)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{buyToken.symbol}</Box>
            </Flex>
          </Flex>
          <Box sx={{ mt: 1 }}>
            {toLink ? (
              <NetworkLink href={toLink} rel="noopener noreferrer" target="_blank">
                <CustomLinkIcon size={12} />
                {toNetwork?.name}
              </NetworkLink>
            ) : (
              <NetworkName>{toNetwork?.name}</NetworkName>
            )}
          </Box>
        </Flex>
      </TokenDetails>

      <TransactionDetails justifyContent="start">
        <Flex flexDirection="column" alignContent="center">
          <Box>- -</Box>
        </Flex>
      </TransactionDetails>

      <TypeDetails>
        <Box color="#8780BF" fontWeight="600">
          {type}
        </Box>
        <Box fontWeight="600">{bridgeId}</Box>
      </TypeDetails>

      <TransactionDetails>
        <Status status={status.toUpperCase()}>{status}</Status>
      </TransactionDetails>

      <TransactionDetails>
        {confirmedTime ? (
          <Flex flexDirection="column" fontSize="12px">
            <Box>{DateTime.fromMillis(confirmedTime).toFormat('HH:mm:ss')}</Box>
            <Box>{DateTime.fromMillis(confirmedTime).toFormat('dd/MM/yyyy')}</Box>
          </Flex>
        ) : (
          '- -'
        )}
      </TransactionDetails>
      <Box width="20px"></Box>
    </GridCard>
  )
}
