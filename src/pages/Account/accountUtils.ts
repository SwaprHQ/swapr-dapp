import { ChainId } from '@swapr/sdk'

import EtherLogo from '../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../assets/images/xdai-logo.png'
import { TransactionDetails } from '../../state/transactions/reducer'

export type Transaction = {
  type: string
  from: { value: number | string; token: string }
  to: { value: number | string; token: string }
  summary: string
  addedTime: number
  confirmedTime?: number
  hash: string
  status: string
  network?: ChainId
}

const expressions = {
  swap: new RegExp('(?<num>\\d*\\.?\\d+) (?<token>[A-Z]+)', 'g'),
  type: new RegExp('^(?<type>[A-Za-z]+)'),
}

export const formattedTransactions = (transactions: { [txHash: string]: TransactionDetails }) => {
  return Object.keys(transactions)
    ?.map(key => {
      const { summary = '', confirmedTime, hash, addedTime, network } = transactions[key]
      const type = summary.match(expressions.type)?.[0]
      const transaction = {
        addedTime,
        confirmedTime,
        hash,
        network,
        summary,
        status: confirmedTime ? 'COMPLETED' : 'PENDING',
        type,
      }

      if (expressions.swap.test(summary) && type === 'Swap') {
        expressions.swap.lastIndex = 0
        const [from, to] = [...summary.matchAll(expressions.swap)]
        return {
          from: {
            value: Number(from?.groups?.num ?? 0),
            token: from?.groups?.token,
          },
          to: {
            value: Number(to?.groups?.num ?? 0),
            token: to?.groups?.token,
          },
          ...transaction,
        }
      }

      return undefined
    })
    .filter(Boolean)
    .sort((txn1, txn2) => txn2!.addedTime - txn1!.addedTime) as Transaction[]
}

export function getTokenURLWithNetwork(symbol: string, url?: string) {
  switch (symbol?.toUpperCase()) {
    case 'XDAI':
      return XDAILogo
    case 'POLYGON':
      return PolygonMaticLogo
    case 'ETH':
      return EtherLogo
    default:
      return url
  }
}
