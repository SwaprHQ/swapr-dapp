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
}

export function BridgeTransactionRow({ transaction }: BridgeTransactionRowProps) {
  const { type, status, from, to, confirmedTime, logs, bridgeId } = transaction

  const fromNetwork = from.chainId ? getNetworkInfo(Number(from.chainId)) : undefined
  const toNetwork = to?.chainId ? getNetworkInfo(Number(to?.chainId)) : undefined

  const fromLink = getExplorerLink(logs[0]?.chainId, logs[0]?.txHash, 'transaction')
  const toLink =
    logs[1]?.chainId && logs[1]?.txHash ? getExplorerLink(logs[1]?.chainId, logs[1]?.txHash, 'transaction') : undefined

  return (
    <GridCard status={status.toUpperCase()}>
      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={from.token} address={from.tokenAddress} chainId={from.chainId} />
            <Flex flexDirection="column">
              <Box>{formatNumber(from.value, false, true)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{from.token}</Box>
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
            <TokenIcon symbol={to.token} address={to.tokenAddress} chainId={to.chainId} />
            <Flex flexDirection="column">
              <Box>{formatNumber(to.value, false, true)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{to.token}</Box>
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
        <Box color="#8780BF">{type}</Box>
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
    </GridCard>
  )
}
