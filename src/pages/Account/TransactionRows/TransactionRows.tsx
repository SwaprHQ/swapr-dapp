import { Fragment } from 'react'

import { type Transaction, TransactionTypes } from '../Account.types'
import { BridgeTransactionRow } from './BridgeTransactionRow'
import { SwapTransactionRow } from './SwapTransactionRow'

interface TransactionRowProps {
  transactions: Transaction[]
}

export function TransactionRows({ transactions }: TransactionRowProps) {
  return (
    <Fragment>
      {transactions.map((transaction, index) => {
        const { type, hash } = transaction
        const key = `row__${hash ?? index}`
        switch (type) {
          case TransactionTypes.Swap:
            return <SwapTransactionRow transaction={transaction} key={key} />
          case TransactionTypes.Bridge:
            return <BridgeTransactionRow transaction={transaction} key={key} />
          default:
            return <Fragment key={key} />
        }
      })}
    </Fragment>
  )
}
