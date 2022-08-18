import { DateTime } from 'luxon'
import { Box, Flex, Image, Text } from 'rebass'

import { networkOptionsPreset } from '../../components/NetworkSwitcher'
import { formatNumber } from '../../utils/formatNumber'
import { GridCard, Status, TokenRow, TranasctionDetails } from './Account.styles'
import { Transaction } from './accountUtils'
import { TokenIcon } from './TokenIcon'

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { type, status, from, to, addedTime, confirmedTime = addedTime, network } = transaction
  let price = typeof to.value === 'number' && typeof from.value === 'number' ? from.value / to.value : 0
  price = price === Infinity ? 0 : price

  const networkDetails = networkOptionsPreset.find(n => n.chainId.toString() === network?.toString())
  switch (type) {
    case 'Swap':
      return (
        <GridCard status={status}>
          <TranasctionDetails flex="6%">
            <Image sx={{ width: '32px' }} src={networkDetails?.logoSrc} alt={networkDetails?.name} />
          </TranasctionDetails>

          <TranasctionDetails flex="15%" justifyContent="start">
            <TokenIcon symbol={from.token} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(from.value, false, true)}`}</Box>
              <Box>{from.token}</Box>
            </Flex>
          </TranasctionDetails>

          <TranasctionDetails flex="15%" justifyContent="start">
            <TokenIcon symbol={to.token} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(to.value, false, true)}`}</Box>
              <Box>{to.token}</Box>
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
    default:
      return (
        <GridCard status={status}>
          <TranasctionDetails>
            <Image
              sx={{ width: '32px' }}
              src={networkOptionsPreset.find(n => n.chainId.toString() === network?.toString())?.logoSrc}
              alt={network?.toString()}
            />
          </TranasctionDetails>

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
