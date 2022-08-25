import { Fragment } from 'react'

import { type Transaction, TransactionBridgeTypes, TransactionSwapTypes } from '../Account.types'
import { BridgeTransactionRow } from './BridgeTransactionRow'
import { SwapTransactionRow } from './SwapTransactionRow'

interface TransactionRowProps {
  transactions: Transaction[]
  showAllNetworkTransactions: boolean
}

export function TransactionRows({ transactions, showAllNetworkTransactions }: TransactionRowProps) {
  return (
    <Fragment>
      {transactions?.map(transaction => {
        const { type, hash } = transaction
        switch (type) {
          case TransactionSwapTypes.Swap:
            return (
              <SwapTransactionRow
                transaction={transaction}
                showAllNetworkTransactions={showAllNetworkTransactions}
                key={hash}
              />
            )
          case TransactionBridgeTypes.Bridge:
            return <BridgeTransactionRow transaction={transaction} key={hash} />
          default:
            return <Fragment key={`${type}_${hash}`} />
        }
      })}
    </Fragment>
  )
}
