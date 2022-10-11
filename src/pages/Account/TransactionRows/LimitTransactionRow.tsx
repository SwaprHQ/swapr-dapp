import { DateTime } from 'luxon'
import { Box, Flex } from 'rebass'

import { LimitOrderTransaction } from '../../../modules/limit-orders/utils/hooks'
import { getExplorerLink, shortenAddress } from '../../../utils'
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
import { TokenIcon } from '../TokenIcon'

interface LimitTransactionRowProps {
  transaction: LimitOrderTransaction
}

export function LimitTransactionRow({ transaction }: LimitTransactionRowProps) {
  const { type, status, uid, network, sellToken, buyToken, confirmedTime } = transaction

  const transactionNetwork = network ? getNetworkInfo(Number(network)) : undefined
  const link = getExplorerLink(network, uid, 'transaction', 'COW')

  return (
    <GridCard status={status.toUpperCase()}>
      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={sellToken.symbol} address={sellToken.tokenAddress} chainId={network} />
            <Flex flexDirection="column">
              <Box>{formatNumber(sellToken.value, false)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{sellToken.symbol ?? shortenAddress(sellToken.tokenAddress)}</Box>
            </Flex>
          </Flex>
          <Box sx={{ mt: 1 }}>
            <NetworkLink href={link} rel="noopener noreferrer" target="_blank">
              <CustomLinkIcon size={12} />
              {transactionNetwork?.name}
            </NetworkLink>
          </Box>
        </Flex>
      </TokenDetails>

      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={buyToken.symbol} address={buyToken.tokenAddress} chainId={network} />
            <Flex flexDirection="column">
              <Box>{formatNumber(buyToken.value, false)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{buyToken.symbol ?? shortenAddress(buyToken.tokenAddress)}</Box>
            </Flex>
          </Flex>
          <Box sx={{ mt: 1 }}>
            {link ? (
              <NetworkLink href={link} rel="noopener noreferrer" target="_blank">
                <CustomLinkIcon size={12} />
                {transactionNetwork?.name}
              </NetworkLink>
            ) : (
              <NetworkName>{transactionNetwork?.name}</NetworkName>
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
        <Box fontWeight="600">CoW</Box>
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
