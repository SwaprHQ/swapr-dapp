import { Fragment } from 'react'

import { type Transaction, TransactionTypes } from '../Account.types'
import { BridgeTransactionRow } from './BridgeTransactionRow'
import { SwapTransactionRow } from './SwapTransactionRow'

interface TransactionRowProps {
  transactions: Transaction[]
  showBackgroundStatus?: boolean
}

export function TransactionRows({ transactions, showBackgroundStatus = true }: TransactionRowProps) {
  return (
    <Fragment>
      {transactions.map((transaction, index) => {
        const { type, hash } = transaction
        const key = `row__${hash ?? index}`
        switch (type) {
          case TransactionTypes.Swap:
            return (
              <SwapTransactionRow transaction={transaction} key={key} showBackgroundStatus={showBackgroundStatus} />
            )
          case TransactionTypes.Bridge:
            return (
              <BridgeTransactionRow transaction={transaction} key={key} showBackgroundStatus={showBackgroundStatus} />
            )
          case TransactionTypes.Zap:
            return (
              <SwapTransactionRow transaction={transaction} key={key} showBackgroundStatus={showBackgroundStatus} />
            )

          default:
            return <Fragment key={key} />
        }
      })}
    </Fragment>
  )
}
