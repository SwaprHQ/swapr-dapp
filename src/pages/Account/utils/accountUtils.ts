import EtherLogo from '../../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../../assets/images/xdai-logo.png'
import { type LimitOrderTransaction } from '../../Swap/LimitOrderBox/utils/hooks'
import { type AllSwapTransactions, type BridgeTransaction, type Transaction, TransactionStatus } from '../Account.types'
import { formatSwapTransactions } from './swapTransactionsUtils'

export enum TransactionFilter {
  ALL = 'all',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  LIMIT = 'limit',
}

export const formatTransactions = (
  transactions: AllSwapTransactions,
  bridgeTransactions: BridgeTransaction[],
  limitOrderTransactions: LimitOrderTransaction[],
  showPendingTransactions: boolean,
  account: string,
  filter: string | null
) => {
  const swapTransactions = formatSwapTransactions(transactions, account)
  let allTransactions
  if (filter === TransactionFilter.SWAP) {
    allTransactions = swapTransactions
  }
  if (filter === TransactionFilter.BRIDGE) {
    allTransactions = bridgeTransactions
  }
  if (filter === TransactionFilter.LIMIT) {
    allTransactions = limitOrderTransactions
  }
  if (filter === TransactionFilter.ALL || !filter) {
    allTransactions = [...swapTransactions, ...bridgeTransactions, ...limitOrderTransactions]
  }

  const sortedTransactions = (allTransactions ?? []).sort((txn1, txn2) => {
    if (txn1?.confirmedTime && txn2?.confirmedTime && txn1.confirmedTime > txn2.confirmedTime) {
      return -1
    }
    if (
      txn1?.status.toUpperCase() === (TransactionStatus.PENDING || TransactionStatus.OPEN) &&
      txn2?.status.toUpperCase() !== (TransactionStatus.PENDING || TransactionStatus.OPEN)
    ) {
      return -1
    }
    return 1
  }) as Transaction[]

  if (showPendingTransactions) {
    return sortedTransactions.filter(
      txn =>
        txn.status.toUpperCase() === TransactionStatus.PENDING ||
        txn.status.toUpperCase() === TransactionStatus.REDEEM ||
        txn.status.toUpperCase() === TransactionStatus.OPEN
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
