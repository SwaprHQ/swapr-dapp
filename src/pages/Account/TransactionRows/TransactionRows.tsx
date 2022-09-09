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
        switch (type) {
          case TransactionTypes.Swap:
            return <SwapTransactionRow transaction={transaction} key={`row__${hash}__${index}`} />
          case TransactionTypes.Bridge:
            return <BridgeTransactionRow transaction={transaction} key={`row__${hash}__${index}`} />
          default:
            return <Fragment key={`row__${index}`} />
        }
      })}
    </Fragment>
  )
}
