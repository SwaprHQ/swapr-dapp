import { Fragment } from 'react'

import { type Transaction, TransactionType } from '../Account.types'
import { BridgeTransactionRow } from './BridgeTransactionRow'
import { LimitTransactionRow } from './LimitTransactionRow'
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
        const key = `row__${index}__${hash}`
        switch (type) {
          case TransactionType.Swap:
            return (
              <SwapTransactionRow transaction={transaction} key={key} showBackgroundStatus={showBackgroundStatus} />
            )
          case TransactionType.Bridge:
            return (
              <BridgeTransactionRow transaction={transaction} key={key} showBackgroundStatus={showBackgroundStatus} />
            )
          case TransactionType.LimitOrder:
            return <LimitTransactionRow transaction={transaction} key={key} />
          default:
            return <Fragment key={key} />
        }
      })}
    </Fragment>
  )
}
