import { formatSwapTransactions } from './swapTransactionsUtils'
import EtherLogo from '../../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../../assets/images/xdai-logo.png'
import { type LimitOrderTransaction } from '../../Swap/LimitOrderBox/utils/hooks'
import { type AllSwapTransactions, type BridgeTransaction, type Transaction, TransactionStatus } from '../Account.types'

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
  filter: TransactionFilter | null
) => {
  const swapTransactions = formatSwapTransactions(transactions, account) as Transaction[]

  const filteredTransactions: Record<TransactionFilter, Transaction[]> = {
    [TransactionFilter.SWAP]: swapTransactions,
    [TransactionFilter.BRIDGE]: bridgeTransactions,
    [TransactionFilter.LIMIT]: limitOrderTransactions,
    [TransactionFilter.ALL]: [...swapTransactions, ...bridgeTransactions, ...limitOrderTransactions],
  }

  const allTransactions = filteredTransactions[filter || TransactionFilter.ALL]

  const sortedTransactions = (allTransactions ?? []).sort((txn1, txn2) => {
    if (
      (txn1?.confirmedTime && txn2?.confirmedTime && txn1.confirmedTime > txn2.confirmedTime) ||
      (txn1?.status.toUpperCase() === (TransactionStatus.PENDING || TransactionStatus.OPEN) &&
        txn2?.status.toUpperCase() !== (TransactionStatus.PENDING || TransactionStatus.OPEN))
    ) {
      return -1
    }
    return 1
  })

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
