import EtherLogo from '../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../assets/images/xdai-logo.png'
import { TransactionDetails } from '../../state/transactions/reducer'
import { type BridgeTransaction, type Transaction } from './Account.types'

const getStatus = (status?: 0 | 1, confrimedTime?: number) => {
  if (status === 0) return 'CANCELLED'
  if (status === 1 || confrimedTime !== undefined) return 'COMPLETED'
  return 'PENDING'
}

const expressions = {
  swap: new RegExp('(?<num>\\d*\\.?\\d+) (?<token>[A-Z]+)', 'g'),
  type: new RegExp('^(?<type>[A-Za-z]+)'),
}

export const formattedTransactions = (
  transactions: { [txHash: string]: TransactionDetails },
  bridgeTransactions: BridgeTransaction[]
) => {
  const swapTransactions = Object.keys(transactions)
    ?.map(key => {
      const { summary = '', confirmedTime, hash, addedTime, network, receipt } = transactions[key]
      const type = summary.match(expressions.type)?.[0]
      const { status } = receipt || {}
      const transaction = {
        addedTime,
        confirmedTime,
        hash,
        network,
        summary,
        status: getStatus(status, confirmedTime),
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

  return [...swapTransactions, ...bridgeTransactions].sort(
    (txn1, txn2) => (txn2?.confirmedTime ?? 0) - (txn1?.confirmedTime ?? 0)
  ) as Transaction[] | BridgeTransaction[]
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
