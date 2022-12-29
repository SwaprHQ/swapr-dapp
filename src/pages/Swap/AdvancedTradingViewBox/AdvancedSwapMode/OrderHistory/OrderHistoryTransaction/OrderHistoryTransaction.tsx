import { utils } from 'ethers'
import { DateTime } from 'luxon'
import { ExternalLink } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { CurrencyLogo } from '../../../../../../components/CurrencyLogo'
import { useActiveWeb3React } from '../../../../../../hooks'
import { useToken } from '../../../../../../hooks/Tokens'
import { EXPLORER_LINK_TYPE, getExplorerLink } from '../../../../../../utils'
import { formatNumber } from '../../../../../../utils/formatNumber'
import { Status } from '../../../../../Account/Account.styles'
import { Transaction, TransactionType } from '../../../../../Account/Account.types'

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
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  const isSwapTransaction = tx.type === TransactionType.Swap
  const isLimitOrderTransaction = tx.type === TransactionType.LimitOrder

  const formattedSellToken = useToken(tx.sellToken.tokenAddress)
  const formattedBuyToken = useToken(tx.buyToken.tokenAddress)

  // Find the protocol
  let protocol = 'Unknown'
  if (isSwapTransaction) {
    protocol = tx.swapProtocol ?? 'Unknown'
  } else if (isLimitOrderTransaction) {
    protocol = 'COW'
  }

  // Transaction type can be an AMM order or a COW order which is can also be a market, limit or stop limit order
  let transactionType: string = tx.type

  let sellTokenAmount = tx.sellToken?.value
  let buyTokenAmount = tx.buyToken?.value

  // If the transaction has a creation date and a signature, it's a COW order (safe check)
  if ('creationDate' in tx && 'signature' in tx) {
    transactionType = tx.class.toString()

    // Fix the token amounts
    sellTokenAmount = utils.formatUnits(tx.sellToken?.value, formattedSellToken?.decimals)
    buyTokenAmount = utils.formatUnits(tx.buyToken?.value, formattedBuyToken?.decimals)
  }

  // Compute the explorer link
  let explorerURL = null
  if (isSwapTransaction) {
    explorerURL = chainId && getExplorerLink(chainId, tx.hash, EXPLORER_LINK_TYPE.transaction, tx.swapProtocol)
  } else if (protocol === 'COW') {
    explorerURL = chainId && getExplorerLink(chainId, tx.hash, EXPLORER_LINK_TYPE.transaction, 'COW')
  }

  return (
    <Wrapper>
      <div>
        <CurrencyLogo currency={formattedSellToken ?? undefined} marginRight={4} />
        <Text>{formatNumber(sellTokenAmount)}</Text>
      </div>
      <div>
        <CurrencyLogo currency={formattedBuyToken ?? undefined} marginRight={4} />
        <Text>{formatNumber(buyTokenAmount)}</Text>
      </div>
      <div>{protocol}</div>
      <div>{transactionType.toUpperCase()}</div>
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
        {explorerURL ? (
          <a href={explorerURL} rel="noopener noreferrer" target="_blank">
            <ExternalLink size="15" color={theme.text4} />
          </a>
        ) : (
          '-'
        )}
      </div>
    </Wrapper>
  )
}
