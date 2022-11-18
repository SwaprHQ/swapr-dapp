import { formatUnits } from 'ethers/lib/utils'
import { DateTime } from 'luxon'
import { useCallback } from 'react'
import { XCircle } from 'react-feather'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

import { CurrencyLogo } from '../../../components/CurrencyLogo'
import { MouseoverTooltip } from '../../../components/Tooltip'
import { useActiveWeb3React } from '../../../hooks'
import { useToken } from '../../../hooks/Tokens'
import { useNotificationPopup } from '../../../state/application/hooks'
import { getExplorerLink, shortenAddress } from '../../../utils'
import { formatNumber } from '../../../utils/formatNumber'
import { getNetworkInfo } from '../../../utils/networksList'
import { LimitOrderTransaction } from '../../Swap/LimitOrderBox/utils/hooks'
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

export const CancelIcon = styled(XCircle)`
  cursor: pointer;
  width: 18px;
  height: 18px;
  color: #ff7e7e;
`

interface LimitTransactionRowProps {
  transaction: LimitOrderTransaction
}

export function LimitTransactionRow({ transaction }: LimitTransactionRowProps) {
  const { type, status, uid, network, sellToken, buyToken, confirmedTime, cancelOrder } = transaction
  const { chainId, library } = useActiveWeb3React()
  const notify = useNotificationPopup()
  const formattedSellToken = useToken(sellToken.tokenAddress)
  const formattedBuyToken = useToken(buyToken.tokenAddress)
  const transactionNetwork = network ? getNetworkInfo(Number(network)) : undefined
  const link = getExplorerLink(network, uid, 'transaction', 'COW')

  const sellTokenValue = Number(formatUnits(sellToken.value, formattedSellToken?.decimals))
  const buyTokenValue = sellTokenValue * Number(formatUnits(buyToken.value, formattedBuyToken?.decimals))

  const price = buyTokenValue / sellTokenValue

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
            {formattedSellToken !== null && (
              <Box sx={{ mr: '6px' }}>
                <CurrencyLogo loading={false} currency={formattedSellToken} size={'32px'} />
              </Box>
            )}
            <Flex flexDirection="column">
              <Box>{formatNumber(sellTokenValue)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>
                {formattedSellToken?.symbol ?? shortenAddress(sellToken.tokenAddress)}
              </Box>
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
            {formattedBuyToken !== null && (
              <Box sx={{ mr: '6px' }}>
                <CurrencyLogo loading={false} currency={formattedBuyToken} size={'32px'} />
              </Box>
            )}
            <Flex flexDirection="column">
              <Box>{formatNumber(buyTokenValue)}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{formattedBuyToken?.symbol ?? shortenAddress(buyToken.tokenAddress)}</Box>
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
          <Box>{price > 0 && price < Infinity ? formatNumber(price) : '- -'}</Box>
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
