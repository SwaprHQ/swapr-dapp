import { ChainId, CoWTrade } from '@swapr/sdk'

import contractNetworks from '@cowprotocol/contracts/networks.json'
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { retry, RetryableError, RetryOptions } from '../../utils/retry'
import { updateBlockNumber } from '../application/actions'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { SwapProtocol, TransactionState } from './reducer'

interface TxInterface {
  addedTime: number
  receipt?: Record<string, any>
  lastCheckedBlockNumber?: number
}

export function shouldCheck(lastBlockNumber: number, tx: TxInterface): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {
  [ChainId.ARBITRUM_ONE]: { n: 10, minWait: 250, maxWait: 1000 },
  [ChainId.ARBITRUM_RINKEBY]: { n: 10, minWait: 250, maxWait: 1000 },
}
const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 1, minWait: 0, maxWait: 0 }

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()

  const lastBlockNumber = useBlockNumber()

  const dispatch = useDispatch()

  const state = useSelector<AppState, TransactionState>(state => state.transactions)

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [chainId, state])

  // show popup on confirm
  const addPopup = useAddPopup()

  const getTransactionReceipt = useCallback(
    (hash: string) => {
      if (!library || !chainId) throw new Error('No library or chainId')
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS
      return retry(
        () =>
          library.getTransactionReceipt(hash).then(receipt => {
            if (receipt === null) {
              console.debug('Retrying for hash', hash)
              throw new RetryableError()
            }
            return receipt
          }),
        retryOptions
      )
    },
    [chainId, library]
  )

  /**
   * Returns order from the Gnosis Protocol API
   */
  const getGnosisProtocolOrder = useCallback(
    (orderId: string) => {
      if (!chainId) throw new Error('No library or chainId')
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS
      return retry(async () => {
        const res = await CoWTrade.getCowSdk(chainId).cowApi.getOrder(orderId)
        if (!res) {
          console.debug('Retrying for order ', orderId)
          throw new RetryableError()
        }
        return res
      }, retryOptions)
    },
    [chainId]
  )

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    const cancels = Object.values(transactions)
      .filter(({ hash }) => shouldCheck(lastBlockNumber, transactions[hash]))
      .map(({ hash, swapProtocol, summary }) => {
        // Custom check for Gnosis Protocol v2 trades
        if (swapProtocol && swapProtocol === SwapProtocol.COW) {
          const { cancel, promise } = getGnosisProtocolOrder(hash)

          promise
            .then(orderMetadata => {
              if (orderMetadata.status === 'open') {
                return
              }

              const isFulfilled = orderMetadata.status === 'fulfilled'

              // The settlement contract from COW
              const GPv2Settlement = contractNetworks.GPv2Settlement as Record<
                ChainId,
                Record<'transactionHash' | 'address', string>
              >
              const contractAddress = GPv2Settlement[chainId]?.address

              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: '0x0',
                    blockNumber: 0,
                    contractAddress,
                    from: '0x0',
                    to: orderMetadata.receiver,
                    transactionHash: '0x0',
                    transactionIndex: 0,
                    status: isFulfilled ? 1 : 0,
                  },
                })
              )

              addPopup({
                hash,
                success: isFulfilled,
                summary,
                swapProtocol: SwapProtocol.COW,
              })
            })
            .catch()

          return cancel
        }

        const { promise, cancel } = getTransactionReceipt(hash)
        promise
          .then(receipt => {
            if (receipt) {
              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status as 0 | 1 | undefined,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex,
                  },
                })
              )

              addPopup({
                hash,
                success: receipt.status === 1,
                summary: transactions[hash]?.summary,
              })

              // the receipt was fetched before the block, fast forward to that block to trigger balance updates
              if (receipt.blockNumber > lastBlockNumber) {
                dispatch(
                  updateBlockNumber({
                    chainId,
                    blockNumber: receipt.blockNumber,
                  })
                )
              }
            } else {
              dispatch(
                checkedTransaction({
                  chainId,
                  hash,
                  blockNumber: lastBlockNumber,
                })
              )
            }
          })
          .catch(error => {
            if (!error.isCancelledError) {
              console.error(`Failed to check transaction hash: ${hash}`, error)
            }
          })
        return cancel
      })

    return () => {
      cancels.forEach(cancel => cancel())
    }
  }, [
    chainId,
    library,
    transactions,
    lastBlockNumber,
    dispatch,
    addPopup,
    getTransactionReceipt,
    getGnosisProtocolOrder,
  ])

  return null
}
