import { DateTime } from 'luxon'
import { Box, Flex, Image } from 'rebass'

import { networkOptionsPreset } from '../../components/NetworkSwitcher'
import { formatNumber } from '../../utils/formatNumber'
import { GridCard, Status, TokenDetails, TokenRow } from './Account.styles'
import { Transaction } from './accountUtils'
import { TokenIcon } from './TokenIcon'

interface TransactionRowProps {
  allNetworkTransactions: boolean
  transaction: Transaction
}

export function TransactionRow({ allNetworkTransactions, transaction }: TransactionRowProps) {
  const { type, status, from, to, addedTime, confirmedTime = addedTime, network, summary } = transaction
  const price = typeof to.value === 'number' && typeof from.value === 'number' ? to.value / from.value : 0
  const networkConfig = networkOptionsPreset.find(n => n.chainId.toString() === network?.toString())

  switch (type) {
    case 'Swap':
      return (
        <GridCard status={status}>
          {allNetworkTransactions && (
            <Flex flex="5%">
              <Image
                sx={{ width: '32px' }}
                src={networkOptionsPreset.find(n => n.chainId.toString() === network?.toString())?.logoSrc}
                alt="adas"
              />
            </Flex>
          )}

          <Flex flex="8%">{type}</Flex>

          <TokenRow>
            <TokenIcon symbol={from.token} />
            <Flex flexDirection="column" alignItems="end">
              <Box>{`${formatNumber(from.value, false, true)}`}</Box>
              <Box>{from.token}</Box>
            </Flex>
          </TokenRow>

          <TokenRow>
            <TokenIcon symbol={to.token} />
            <Flex flexDirection="column" alignItems="end">
              <Box>{`${formatNumber(to.value, false, true)}`}</Box>
              <Box>{to.token}</Box>
            </Flex>
          </TokenRow>

          <Flex flex="15%" justifyContent="right" sx={{ pr: 2 }}>{`${formatNumber(price, true, true)}`}</Flex>

          <TokenDetails>
            <Status status={status}>{status}</Status>
          </TokenDetails>

          <TokenDetails flex="16%">
            {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
          </TokenDetails>

          <TokenDetails flex="12%">Details</TokenDetails>
        </GridCard>
      )
    case 'Claim':
      return (
        <GridCard status={status}>
          {allNetworkTransactions && (
            <Flex flex="5%">
              <Image sx={{ width: '32px' }} src={networkConfig?.logoSrc} alt={networkConfig?.name} />
            </Flex>
          )}
          <Flex flex="8%">{type}</Flex>
          <TokenDetails flex="44%">{summary}</TokenDetails>
          <TokenDetails>
            <Status status={status}>{status}</Status>
          </TokenDetails>
          <TokenDetails flex="16%">
            {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
          </TokenDetails>
          <TokenDetails flex="12%">Details</TokenDetails>
        </GridCard>
      )
    case 'Approve':
      return (
        <GridCard status={status}>
          {allNetworkTransactions && (
            <Flex flex="5%">
              <Image sx={{ width: '32px' }} src={networkConfig?.logoSrc} alt={networkConfig?.name} />
            </Flex>
          )}
          <Flex flex="8%">{type}</Flex>
          <TokenDetails flex="44%">
            <Box sx={{ mr: 1 }}>{type}</Box>
            <TokenIcon symbol={from.token} />
            <Flex flexDirection="column" alignItems="end">
              <Box>{from.token}</Box>
            </Flex>
          </TokenDetails>
          <TokenDetails>
            <Status status={status}>{status}</Status>
          </TokenDetails>
          <TokenDetails flex="16%">
            {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
          </TokenDetails>
          <TokenDetails flex="12%">Details</TokenDetails>
        </GridCard>
      )
    default:
      return (
        <GridCard status={status}>
          {allNetworkTransactions && (
            <Flex flex="5%">
              <Image sx={{ width: '32px' }} src={networkConfig?.logoSrc} alt={networkConfig?.name} />
            </Flex>
          )}
          <Flex flex="8%">{type}</Flex>
          <TokenDetails flex="44%">
            <Box sx={{ mr: 1 }}>{type}</Box>
            <TokenIcon symbol={from.token} />
            <Flex flexDirection="column" alignItems="end">
              {from.value > 0 && <Box>{`${formatNumber(from.value, false, true)}`}</Box>}
              <Box>{from.token}</Box>
            </Flex>
            <Box sx={{ mx: 3 }}>and</Box>
            <TokenIcon symbol={to.token} />
            <Flex flexDirection="column" alignItems="end">
              {to.value > 0 && <Box>{`${formatNumber(to.value, false, true)}`}</Box>}
              <Box>{to.token}</Box>
            </Flex>
          </TokenDetails>
          <TokenDetails>
            <Status status={status}>{status}</Status>
          </TokenDetails>
          <TokenDetails flex="16%">
            {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
          </TokenDetails>
          <TokenDetails flex="12%">Details</TokenDetails>
        </GridCard>
      )
  }
}
