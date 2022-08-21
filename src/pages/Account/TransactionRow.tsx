import { DateTime } from 'luxon'
import { Box, Flex, Text } from 'rebass'

import { formatNumber } from '../../utils/formatNumber'
import { getNetworkInfo } from '../../utils/networksList'
import { GridCard, Status, TokenRow, TranasctionDetails } from './Account.styles'
import { type BridgeTransaction, type Transaction, TransactionBridgeTypes, TransactionSwapTypes } from './Account.types'
import { TokenIcon } from './TokenIcon'

interface TransactionRowProps {
  transaction: Transaction | BridgeTransaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { type, status, from, to, confirmedTime, network } = transaction
  let price = typeof to.value === 'number' && typeof from.value === 'number' ? from.value / to.value : 0
  price = price === Infinity ? 0 : price
  const networkDetails = network ? getNetworkInfo(Number(network)) : undefined

  switch (type) {
    case TransactionSwapTypes.Swap:
      return (
        <GridCard status={status}>
          {/* <TranasctionDetails flex="6%">
            <Image sx={{ width: '32px' }} src={networkDetails?.logoSrc} alt={networkDetails?.name} />
          </TranasctionDetails> */}
          <TranasctionDetails flex="15%" justifyContent="start">
            <Flex flexDirection="column">
              <Flex alignItems="center">
                <TokenIcon symbol={from.token} />
                <Flex flexDirection="column">
                  <Box>{`${formatNumber(from.value, false, true)}`}</Box>
                  <Box sx={{ fontSize: '14px' }}>{from.token}</Box>
                </Flex>
              </Flex>
              <Box sx={{ textTransform: 'uppercase', fontSize: '10px', mt: 1 }}>{networkDetails?.name}</Box>
            </Flex>
          </TranasctionDetails>

          <TranasctionDetails flex="15%" justifyContent="start">
            {/* <TokenIcon symbol={to.token} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(to.value, false, true)}`}</Box>
              <Box>{to.token}</Box>
            </Flex> */}
            <Flex flexDirection="column">
              <Flex alignItems="center">
                <TokenIcon symbol={to.token} />
                <Flex flexDirection="column">
                  <Box>{`${formatNumber(to.value, false, true)}`}</Box>
                  <Box sx={{ fontSize: '14px' }}>{to.token}</Box>
                </Flex>
              </Flex>
              <Box sx={{ textTransform: 'uppercase', fontSize: '10px', mt: 1 }}>{networkDetails?.name}</Box>
            </Flex>
          </TranasctionDetails>
          <TranasctionDetails>{type}</TranasctionDetails>

          <TranasctionDetails justifyContent="start">
            <Flex flexDirection="column" alignContent={'center'}>
              <Box> {`${formatNumber(price, false, true)}`}</Box>
              <Box sx={{ fontSize: '10px' }}>{`${from.token} / ${to.token}`}</Box>
            </Flex>
          </TranasctionDetails>

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
    case TransactionBridgeTypes.Bridge:
      const fromNetwork = from?.chainId ? getNetworkInfo(Number(from?.chainId)) : undefined
      const toNetwork = to?.chainId ? getNetworkInfo(Number(to?.chainId)) : undefined
      const { bridgeId } = transaction
      return (
        <GridCard status={status.toUpperCase()}>
          {/* <TranasctionDetails flex="6%">
            <Image sx={{ width: '32px' }} src={networkDetails?.logoSrc} alt={networkDetails?.name} />
          </TranasctionDetails> */}

          <TranasctionDetails flex="15%" justifyContent="start">
            <Flex flexDirection="column">
              <Flex alignItems="center">
                <TokenIcon symbol={from.token} />
                <Flex flexDirection="column">
                  <Box>{`${formatNumber(from.value, false, true)}`}</Box>
                  <Box sx={{ fontSize: '14px' }}>{from.token}</Box>
                </Flex>
              </Flex>
              <Box sx={{ textTransform: 'uppercase', fontSize: '10px', mt: 1 }}>{fromNetwork?.name}</Box>
            </Flex>
          </TranasctionDetails>

          <TranasctionDetails flex="15%" justifyContent="start">
            <Flex flexDirection="column">
              <Flex alignItems="center">
                <TokenIcon symbol={to.token} />
                <Flex flexDirection="column">
                  <Box>{`${formatNumber(to.value, false, true)}`}</Box>
                  <Box sx={{ fontSize: '14px' }}>{to.token}</Box>
                </Flex>
              </Flex>
              <Box sx={{ textTransform: 'uppercase', fontSize: '10px', mt: 1 }}>{toNetwork?.name}</Box>
            </Flex>
          </TranasctionDetails>
          <TranasctionDetails>{type}</TranasctionDetails>

          <TranasctionDetails justifyContent="start">
            <Flex flexDirection="column" alignContent={'center'}>
              <Box> {bridgeId.toUpperCase()}</Box>
              {/* <Box sx={{ fontSize: '10px' }}>{`${from.token} / ${to.token}`}</Box> */}
            </Flex>
          </TranasctionDetails>

          <TranasctionDetails>
            <Status status={status.toUpperCase()}>{status}</Status>
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

    default:
      return (
        <GridCard status={status}>
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
          <Flex flex="8%">{type}</Flex>

          <Flex flex="15%" justifyContent="right" sx={{ pr: 2 }}>{`${formatNumber(price, true, true)}`}</Flex>

          <TranasctionDetails>
            <Status status={status}>{status}</Status>
          </TranasctionDetails>

          <TranasctionDetails flex="16%">
            {confirmedTime ? DateTime.fromMillis(confirmedTime).toFormat('yyyy-MM-dd HH:mm:ss') : '- -'}
          </TranasctionDetails>
        </GridCard>
      )
  }
}

export function NoDataTransactionRow() {
  return (
    <GridCard>
      <Flex flex={1}>
        <Text sx={{ textAlign: 'center', width: '100%' }}>No transactions to show</Text>
      </Flex>
    </GridCard>
  )
}
