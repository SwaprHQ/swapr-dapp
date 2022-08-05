import { ChainId } from '@swapr/sdk'

import { TransactionDetails } from '../../state/transactions/reducer'

export type Transaction = {
  type: string
  from: { value: number; token: string }
  to: { value: number; token: string }
  addedTime: number
  confirmedTime?: number
  hash: string
  status: string
  network?: ChainId
}

const expressions = {
  swap: new RegExp('(?<num>\\d*\\.?\\d+) (?<token>[A-Z]+)', 'g'),
  type: new RegExp('^(?<type>[A-Za-z]+)'),
  approve: new RegExp('Approve (?<token>[A-Z]+)'),
}

export const formattedTransactions = (transactions: { [txHash: string]: TransactionDetails }) => {
  return Object.keys(transactions)
    ?.map(key => {
      const { summary = '', confirmedTime, hash, addedTime, network } = transactions[key]
      const transaction = {
        addedTime,
        confirmedTime,
        hash,
        network,
        status: confirmedTime ? 'COMPLETED' : 'PENDING',
      }
      if (expressions.swap.test(summary)) {
        expressions.swap.lastIndex = 0
        const [from, to] = [...summary.matchAll(expressions.swap)]
        const type = summary.match(expressions.type)?.[0] ?? 'Swap'
        return {
          type,
          from: {
            value: Number(from.groups?.num ?? 0),
            token: from.groups?.token,
          },
          to: {
            value: Number(to.groups?.num ?? 0),
            token: to.groups?.token,
          },
          ...transaction,
        }
      }
      if (expressions.approve.test(summary)) {
        expressions.approve.lastIndex = 0
        const approve = summary.match(expressions.approve)
        return {
          type: 'Approve',
          from: {
            value: 0,
            token: approve?.groups?.token,
          },
          to: {
            value: 0,
            token: approve?.groups?.token,
          },
          ...transaction,
        }
      }
      return undefined
    })
    .filter(Boolean)
    .sort((txn1, txn2) => txn2!.addedTime - txn1!.addedTime) as Transaction[]
}
