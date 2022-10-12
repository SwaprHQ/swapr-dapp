import { ChainId } from '@swapr/sdk'

import { DateTime } from 'luxon'
import { Text } from 'rebass'
import styled from 'styled-components'

import { ExternalLink } from '../../../../../theme'
import { getExplorerLink } from '../../../../../utils'
import { getNetworkInfo } from '../../../../../utils/networksList'
import { Status } from '../../../../Account/Account.styles'
import { Transaction, TransactionTypes } from '../../../../Account/Account.types'
import { TokenIcon } from '../../../../Account/TokenIcon'

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
  const isBridgeTransaction = tx.type === TransactionTypes.Bridge

  const [fromChainId, toChainId] = [
    isBridgeTransaction ? Number(tx.from.chainId) : (tx.network as ChainId),
    isBridgeTransaction ? Number(tx.to.chainId) : (tx.network as ChainId),
  ]

  const [fromTransactionHash, toTransactionHash] = [
    isBridgeTransaction ? tx.logs[0]?.txHash : tx?.hash,
    isBridgeTransaction ? tx.logs[1]?.txHash : tx?.hash,
  ]

  const fromNetwork = getNetworkInfo(fromChainId)
  const toNetwork = getNetworkInfo(toChainId)

  return (
    <Wrapper>
      <div>
        <ExternalLink
          style={{ display: 'flex', alignItems: 'center' }}
          href={getExplorerLink(fromChainId, fromTransactionHash, 'transaction')}
        >
          <img
            style={{ marginTop: '-4px', marginRight: '5px' }}
            height="20px"
            width="20px"
            alt="Chain Logo"
            src={fromNetwork.logoSrc}
          />
          <div>{fromNetwork.name}</div>
        </ExternalLink>
      </div>
      <div>
        <ExternalLink
          style={{ display: 'flex', alignItems: 'center' }}
          href={getExplorerLink(toChainId, toTransactionHash, 'transaction')}
        >
          <img
            style={{ marginTop: '-4px', marginRight: '5px' }}
            height="20px"
            width="20px"
            alt="Chain Logo"
            src={toNetwork.logoSrc}
          />
          <div>{toNetwork.name}</div>
        </ExternalLink>
      </div>
      <div>
        <TokenIcon symbol={tx.from.token} width={20} height={20} />
        <Text>{tx.from.value}</Text>
      </div>
      <div>
        <TokenIcon symbol={tx.to.token} width={20} height={20} />
        <Text>{tx.to.value}</Text>
      </div>
      <div>{tx.confirmedTime ? DateTime.fromMillis(tx.confirmedTime).toFormat('dd/MM/yyyy') : '-'}</div>
      <div>
        <Status status={tx.status.toUpperCase()}>{tx.status}</Status>
      </div>
    </Wrapper>
  )
}
