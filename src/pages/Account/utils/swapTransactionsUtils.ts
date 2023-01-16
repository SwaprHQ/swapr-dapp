import { AllSwapTransactions, TransactionStatus, TransactionType } from '../Account.types'

const expressions = {
  swap: new RegExp(
    '(?<num>\\d*\\.?\\d+) (?<token>(?:[0-9]{1})?[a-zA-Z]+)|on\\s+(?<protocol>\\w+)|(to (?<alternate>[\\S]*)$)',
    'g'
  ),
  type: new RegExp('^(?<type>[A-Za-z]+)'),
}

const getStatus = (status?: 0 | 1, confrimedTime?: number) => {
  if (status === 0) return TransactionStatus.CANCELLED
  if (status === 1 || confrimedTime !== undefined) return TransactionStatus.COMPLETED
  return TransactionStatus.PENDING
}

export const formatSwapTransactions = (transactions: AllSwapTransactions, account: string) => {
  return Object.keys(transactions)
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

      if (expressions.swap.test(summary) && type === TransactionType.Swap) {
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
          sellToken: {
            value: Number(from?.groups?.num ?? 0),
            symbol: from?.groups?.token,
          },
          buyToken: {
            value: Number(to?.groups?.num ?? 0),
            symbol: to?.groups?.token,
          },
          swapProtocol: protocol,
          alternateReceiver,
        }
      }

      return undefined
    })
    .filter(Boolean)
}
