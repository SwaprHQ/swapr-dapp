import EtherLogo from '../../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../../assets/images/xdai-logo.png'
import { type LimitOrderTransaction } from '../../../modules/limit-orders/utils/hooks'
import { type AllSwapTransactions, type BridgeTransaction, type Transaction, TransactionStatus } from '../Account.types'
import { formatSwapTransactions } from './swapTransactionsUtils'

export const formattedTransactions = (
  transactions: AllSwapTransactions,
  bridgeTransactions: BridgeTransaction[],
  limitOrderTransactions: LimitOrderTransaction[],
  showPendingTransactions: boolean,
  account: string
) => {
  const swapTransactions = formatSwapTransactions(transactions, account)
  const limitTransactions = limitOrderTransactions
  const sortedTransactions = [...swapTransactions, ...bridgeTransactions, ...limitTransactions].sort((txn1, txn2) => {
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
