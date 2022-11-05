import { DateTime } from 'luxon'
import { useCallback } from 'react'
import { XCircle } from 'react-feather'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { MouseoverTooltip } from '../../../components/Tooltip'
import { useActiveWeb3React } from '../../../hooks'
import { useNotificationPopup } from '../../../state/application/hooks'
import { getExplorerLink, shortenAddress } from '../../../utils'
import { formatNumber } from '../../../utils/formatNumber'
import { getNetworkInfo } from '../../../utils/networksList'
import { LimitOrderTransaction } from '../../Swap/LimitOrderBox/limit-orders/utils/hooks'
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

export const CancelIcon = styled(XCircle)`
  cursor: pointer;
  width: 15px;
  height: 15px;
  color: #ff7e7e;
`

interface LimitTransactionRowProps {
  transaction: LimitOrderTransaction
}

export function LimitTransactionRow({ transaction }: LimitTransactionRowProps) {
  const { type, status, uid, network, sellToken, buyToken, confirmedTime, cancelOrder } = transaction
  const { chainId, library } = useActiveWeb3React()
  const notify = useNotificationPopup()

  const transactionNetwork = network ? getNetworkInfo(Number(network)) : undefined
  const link = getExplorerLink(network, uid, 'transaction', 'COW')

  const handleDeleteOpenOrders = useCallback(async () => {
    if (chainId && library) {
      const response = await cancelOrder?.(uid, library)
      if (response) {
        notify('Open order deleted successfully.')
      }
    }
  }, [cancelOrder, chainId, library, notify, uid])

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
      <Box width="20px">
        {status === 'open' && (
          <MouseoverTooltip content="Cancel open order">
            <CancelIcon onClick={handleDeleteOpenOrders} aria-label="Cancel Open Order" />
          </MouseoverTooltip>
        )}
      </Box>
    </GridCard>
  )
}
