import { formatUnits } from 'ethers/lib/utils'
import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'
import { Repeat, XCircle } from 'react-feather'
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

interface LimitTransactionRowProps {
  transaction: LimitOrderTransaction
}

export function LimitTransactionRow({ transaction }: LimitTransactionRowProps) {
  const { type, status, uid, network, sellToken, buyToken, confirmedTime, cancelOrder } = transaction
  const { chainId, library } = useActiveWeb3React()
  const [flipPrice, setFlipPrice] = useState(true)
  const notify = useNotificationPopup()
  const formattedSellToken = useToken(sellToken.tokenAddress)
  const formattedBuyToken = useToken(buyToken.tokenAddress)
  const [link, transactionNetwork] = network
    ? [getExplorerLink(network, uid, 'transaction', 'COW'), getNetworkInfo(Number(network))]
    : []
  const sellTokenValue = Number(formatUnits(sellToken.value, formattedSellToken?.decimals))
  const buyTokenValue = Number(formatUnits(buyToken.value, formattedBuyToken?.decimals))

  const price = flipPrice ? buyTokenValue / sellTokenValue : sellTokenValue / buyTokenValue

  const formattedPrice = price > 0 && price < Infinity ? `${formatNumber(price)}` : '- -'

  const tokenPair = flipPrice
    ? `${formattedBuyToken?.symbol} / ${formattedSellToken?.symbol}`
    : `${formattedSellToken?.symbol} / ${formattedBuyToken?.symbol}`

  const handleDeleteOpenOrders = useCallback(async () => {
    if (chainId && library) {
      const response = await cancelOrder?.(uid, library)
      if (response) {
        notify('Open order cancelled successfully.')
      } else {
        notify('Failed to cancel open limit order.', false)
      }
    }
  }, [cancelOrder, chainId, library, notify, uid])

  const handleFlip = useCallback(() => setFlipPrice(flip => !flip), [])

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
          {link && (
            <Box sx={{ mt: 1 }}>
              <NetworkLink href={link} rel="noopener noreferrer" target="_blank">
                <CustomLinkIcon size={12} />
                {transactionNetwork?.name}
              </NetworkLink>
            </Box>
          )}
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
        <Flex flexDirection="column" alignContent="center" onClick={handleFlip} sx={{ cursor: 'pointer' }}>
          <Box>{formattedPrice}</Box>
          <Box sx={{ fontSize: '10px' }}>
            {tokenPair}
            <StyledSwitch />
          </Box>
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

export const CancelIcon = styled(XCircle)`
  cursor: pointer;
  width: 18px;
  height: 18px;
  color: #ff7e7e;
`

export const StyledSwitch = styled(Repeat)`
  width: 12px;
  height: 12px;
  color: ${props => props.theme.purple3};
  margin-left: 4px;
`
