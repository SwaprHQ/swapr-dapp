import { Fragment } from 'react'

import { type Transaction, TransactionTypes } from '../Account.types'
import { BridgeTransactionRow } from './BridgeTransactionRow'
import { SwapTransactionRow } from './SwapTransactionRow'

interface TransactionRowProps {
  transactions: Transaction[]
  showAllNetworkTransactions: boolean
}

export function TransactionRows({ transactions, showAllNetworkTransactions }: TransactionRowProps) {
  return (
    <Fragment>
      {transactions.map((transaction, index) => {
        const { type, hash } = transaction
        switch (type) {
          case TransactionTypes.Swap:
            return (
              <SwapTransactionRow
                transaction={transaction}
                showAllNetworkTransactions={showAllNetworkTransactions}
                key={hash ?? index}
              />
            )
          case TransactionTypes.Bridge:
            return <BridgeTransactionRow transaction={transaction} key={hash ?? index} />
          default:
            return <Fragment key={hash ?? index} />
        }
      })}
    </Fragment>
  )
}
