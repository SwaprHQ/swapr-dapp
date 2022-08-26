import { DateTime } from 'luxon'
import { Box, Flex } from 'rebass'

import { formatNumber } from '../../../utils/formatNumber'
import { getNetworkInfo } from '../../../utils/networksList'
import { GridCard, Status, TokenDetails, TranasctionDetails, TypeDetails } from '../Account.styles'
import { type BridgeTransaction } from '../Account.types'
import { TokenIcon } from '../TokenIcon'

interface BridgeTransactionRowProps {
  transaction: BridgeTransaction
}

export function BridgeTransactionRow({ transaction }: BridgeTransactionRowProps) {
  const { type, status, from, to, confirmedTime } = transaction

  const fromNetwork = from?.chainId ? getNetworkInfo(Number(from?.chainId)) : undefined
  const toNetwork = to?.chainId ? getNetworkInfo(Number(to?.chainId)) : undefined
  const { bridgeId } = transaction

  return (
    <GridCard status={status.toUpperCase()}>
      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={from.token} address={from.tokenAddress} chainId={from.chainId} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(from.value, false, true)}`}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{from.token}</Box>
            </Flex>
          </Flex>
          <Box sx={{ textTransform: 'uppercase', fontSize: '10px', mt: 1 }}>{fromNetwork?.name}</Box>
        </Flex>
      </TokenDetails>

      <TokenDetails>
        <Flex flexDirection="column">
          <Flex alignItems="center">
            <TokenIcon symbol={to.token} address={to.tokenAddress} chainId={to.chainId} />
            <Flex flexDirection="column">
              <Box>{`${formatNumber(to.value, false, true)}`}</Box>
              <Box sx={{ fontSize: '0.8em' }}>{to.token}</Box>
            </Flex>
          </Flex>
          <Box sx={{ fontSize: '10px', mt: 1, fontWeight: 600 }}>{toNetwork?.name}</Box>
        </Flex>
      </TokenDetails>

      <TranasctionDetails justifyContent="start">
        <Flex flexDirection="column" alignContent={'center'}>
          <Box>- -</Box>
        </Flex>
      </TranasctionDetails>

      <TypeDetails>
        <Box color="#8780BF">{type}</Box>
        <Box fontWeight="600">{bridgeId}</Box>
      </TypeDetails>

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
}
