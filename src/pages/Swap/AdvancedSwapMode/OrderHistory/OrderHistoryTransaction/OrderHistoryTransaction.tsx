import { DateTime } from 'luxon'
import { ExternalLink } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { useWeb3ReactCore } from '../../../../../hooks/useWeb3ReactCore'
import { EXPLORER_LINK_TYPE, getExplorerLink } from '../../../../../utils'
import { Status } from '../../../../Account/Account.styles'
import { Transaction, TransactionTypes } from '../../../../Account/Account.types'
import { TokenIcon } from '../../../../Account/TokenIcon'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;

  & > div {
    flex: 2;
    display: flex;
    align-items: center;
    padding-right: 4px;
  }
  & > div:last-child {
    justify-content: flex-end;
    flex: 1;
  }

  font-size: 12px;
  color: ${({ theme }) => theme.text4};
`

export const OrderHistoryTransaction = ({ tx }: { tx: Transaction }) => {
  const { chainId } = useWeb3ReactCore()
  const theme = useTheme()

  const isSwapTransaction = tx.type === TransactionTypes.Swap

  const protocol = isSwapTransaction ? tx.swapProtocol ?? 'Swapr' : 'Socket'
  const transactionType = isSwapTransaction ? tx.type : 'Bridge Swap'

  return (
    <Wrapper>
      <div>
        <TokenIcon symbol={tx.from.token} width={20} height={20} />
        <Text>{tx.from.value}</Text>
      </div>
      <div>
        <TokenIcon symbol={tx.to.token} width={20} height={20} />
        <Text>{tx.to.value}</Text>
      </div>
      <div>{protocol}</div>
      <div>{transactionType}</div>
      <div>
        {tx.confirmedTime ? (
          <>
            {DateTime.fromMillis(tx.confirmedTime).toFormat('dd/MM/yyyy')}{' '}
            {DateTime.fromMillis(tx.confirmedTime).toFormat('HH:mm')}
          </>
        ) : (
          '-'
        )}
      </div>
      <div>
        <Status status={tx.status.toUpperCase()}>{tx.status}</Status>
      </div>
      <div>
        {isSwapTransaction ? (
          <a
            href={chainId && getExplorerLink(chainId, tx.hash, EXPLORER_LINK_TYPE.transaction, tx.swapProtocol)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink size="15" color={theme.text4} />
          </a>
        ) : (
          '-'
        )}
      </div>
    </Wrapper>
  )
}
