import { DateTime } from 'luxon'
import { Text } from 'rebass'
import styled from 'styled-components'

import { formatNumber } from '../../../../../../utils/formatNumber'
import { Status } from '../../../../../Account/Account.styles'
import { Transaction, TransactionTypes } from '../../../../../Account/Account.types'
import { TokenIcon } from '../../../../../Account/TokenIcon'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;

  & > div {
    flex: 1;
    display: flex;
    align-items: center;
  }
  & > div:last-child {
    justify-content: flex-end;
  }

  font-size: 12px;
  color: ${({ theme }) => theme.text4};
`

export const OrderHistoryTransaction = ({ tx }: { tx: Transaction }) => {
  const isSwapTransaction = tx.type === TransactionTypes.Swap

  const protocol = isSwapTransaction ? tx.swapProtocol ?? 'Swapr' : 'Socket'
  const transactionType = isSwapTransaction ? tx.type : 'Bridge Swap'

  return (
    <Wrapper>
      <div>
        <TokenIcon symbol={tx.sellToken?.symbol} width={20} height={20} />
        <Text>{formatNumber(tx.sellToken?.value)}</Text>
      </div>
      <div>
        <TokenIcon symbol={tx.buyToken?.symbol} width={20} height={20} />
        <Text>{formatNumber(tx.buyToken?.value)}</Text>
      </div>
      <div>{protocol}</div>
      <div>{transactionType}</div>
      <div>
        {tx.confirmedTime ? (
          <>
            {DateTime.fromMillis(tx.confirmedTime).toFormat('dd/MM/yyyy')}{' '}
            {DateTime.fromMillis(tx.confirmedTime).toFormat('HH:mm:ss')}
          </>
        ) : (
          '-'
        )}
      </div>
      <div>
        <Status status={tx.status.toUpperCase()}>{tx.status}</Status>
      </div>
    </Wrapper>
  )
}
