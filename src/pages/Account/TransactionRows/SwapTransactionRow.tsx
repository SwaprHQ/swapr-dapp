import { DateTime } from 'luxon'
import { Box, Flex } from 'rebass'

import { getExplorerLink } from '../../../utils'
import { formatNumber } from '../../../utils/formatNumber'
import { getNetworkInfo } from '../../../utils/networksList'
import {
  CustomLinkIcon,
  GridCard,
  NetworkLink,
  Status,
  TokenDetails,
  TranasctionDetails,
  TypeDetails,
} from '../Account.styles'
import { SwapTransaction } from '../Account.types'
import { TokenIcon } from '../TokenIcon'

interface SwapTransactionRowProps {
  transaction: SwapTransaction
  showAllNetworkTransactions: boolean
}

export function SwapTransactionRow({ transaction, showAllNetworkTransactions }: SwapTransactionRowProps) {
  const { type, status, from, to, confirmedTime, network, hash } = transaction
  const networkDetails = network ? getNetworkInfo(Number(network)) : undefined
  let price = typeof to.value === 'number' && typeof from.value === 'number' ? from.value / to.value : 0
  price = price === Infinity ? 0 : price
  const link = network ? getExplorerLink(Number(network), hash, 'transaction') : '#'

  return (
    <GridCard status={status}>
      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={from.token} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(from.value, false, true)}`}</Box>
              <Box sx={{ fontSize: '14px' }}>{from.token}</Box>
            </Flex>
          </Flex>
          {showAllNetworkTransactions && (
            <Box sx={{ mt: 1 }}>
              <NetworkLink href={link} rel="noopener noreferrer" target="_blank">
                <CustomLinkIcon size={12} />
                {networkDetails?.name}
              </NetworkLink>
            </Box>
          )}
        </Flex>
      </TokenDetails>

      <TokenDetails justifyContent="start">
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={to.token} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(to.value, false, true)}`}</Box>
              <Box sx={{ fontSize: '14px' }}>{to.token}</Box>
            </Flex>
          </Flex>
          {showAllNetworkTransactions && (
            <Box sx={{ mt: 1 }}>
              <NetworkLink href={link} rel="noopener noreferrer" target="_blank">
                <CustomLinkIcon size={12} />
                {networkDetails?.name}
              </NetworkLink>
            </Box>
          )}
        </Flex>
      </TokenDetails>

      <TranasctionDetails justifyContent="start">
        <Flex flexDirection="column" alignContent={'center'}>
          <Box> {`${formatNumber(price, false, true)}`}</Box>
          <Box sx={{ fontSize: '10px' }}>{`${from.token} / ${to.token}`}</Box>
        </Flex>
      </TranasctionDetails>

      <TypeDetails>
        <Box color="#8780BF" fontWeight="600">
          {type}
        </Box>
      </TypeDetails>

      <TranasctionDetails>
        <Status status={status}>{status}</Status>
      </TranasctionDetails>

      <TranasctionDetails>
        {confirmedTime ? (
          <Flex flexDirection="column" fontSize="12px">
            <Box>{DateTime.fromMillis(confirmedTime).toFormat('HH:mm:ss')}</Box>
            <Box>{DateTime.fromMillis(confirmedTime).toFormat('dd/MM/yyyy')}</Box>
          </Flex>
        ) : (
          '- -'
        )}
      </TranasctionDetails>
    </GridCard>
  )
}
