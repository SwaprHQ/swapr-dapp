import EtherLogo from '../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../assets/images/xdai-logo.png'
import { BridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { TransactionDetails } from '../../state/transactions/reducer'
import { type BridgeTransaction, type Transaction, TransactionStatus } from './Account.types'

const getStatus = (status?: 0 | 1, confrimedTime?: number) => {
  if (status === 0) return 'CANCELLED'
  if (status === 1 || confrimedTime !== undefined) return 'COMPLETED'
  return 'PENDING'
}

const expressions = {
  swap: new RegExp(
    '(?<num>\\d*\\.?\\d+) (?<token>(?:[0-9]{1})?[a-zA-Z]+)|on\\s+(?<protocol>\\w+)|(to (?<alternate>[\\S]*)$)',
    'g'
  ),
  type: new RegExp('^(?<type>[A-Za-z]+)'),
}

export const mapBridgeIdToDisplayName = (bridgeId: BridgeList) => {
  switch (bridgeId) {
    case 'arbitrum:mainnet':
    case 'arbitrum:testnet':
      return 'Arbitrum'
    case 'connext':
      return 'Connext'
    case 'omnibridge:eth-xdai':
      return 'Omnibridge'
    case 'socket':
      return 'Socket'
    case 'xdai':
      return 'xDai'
  }
}

export const formattedTransactions = (
  transactions: { [txHash: string]: TransactionDetails },
  bridgeTransactions: BridgeTransaction[],
  showPendingTransactions: boolean,
  account: string
) => {
  const swapTransactions = Object.keys(transactions)
    .map(key => {
      const { summary = '', confirmedTime, hash, addedTime, network, receipt, from, swapProtocol } = transactions[key]
      if (from.toLowerCase() !== account.toLowerCase()) {
        return undefined
      }
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
        const [from, to, matchProtocol, matchAlternate] = [...summary.matchAll(expressions.swap)]

        /*  Getting protocol name from transaction string
            `Swap 0.1 XDAI for 0.099975 USDC on Curve`
            Curve will be taken from above transaction string
         */
        const protocol = swapProtocol ? swapProtocol : matchProtocol?.groups?.protocol

        const alternateReceiver = matchAlternate?.groups?.alternate

        return {
          ...transaction,
          from: {
            value: Number(from?.groups?.num ?? 0),
            token: from?.groups?.token,
          },
          to: {
            value: Number(to?.groups?.num ?? 0),
            token: to?.groups?.token,
          },
          swapProtocol: protocol,
          alternateReceiver,
        }
      }

      return undefined
    })
    .filter(Boolean)

  const sortedTransactions = [...swapTransactions, ...bridgeTransactions].sort((txn1, txn2) => {
    if (txn1?.confirmedTime && txn2?.confirmedTime && txn1.confirmedTime > txn2.confirmedTime) {
      return -1
    }
    if (
      txn1?.status.toUpperCase() === TransactionStatus.PENDING &&
      txn2?.status.toUpperCase() !== TransactionStatus.PENDING
    ) {
      return -1
    }
    return 1
  }) as Transaction[]

  if (showPendingTransactions) {
    return sortedTransactions.filter(
      txn =>
        txn.status.toUpperCase() === TransactionStatus.PENDING || txn.status.toUpperCase() === TransactionStatus.REDEEM
    )
  }

  return sortedTransactions
}

export function getNetworkDefaultTokenUrl(symbol: string, url?: string) {
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
