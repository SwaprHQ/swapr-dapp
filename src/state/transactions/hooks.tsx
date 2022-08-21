import { TransactionResponse } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import cloneDeep from 'lodash/cloneDeep'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { type BridgeTransaction, TransactionBridgeTypes } from '../../pages/Account/Account.types'
import { selectBridgeTransactions } from '../../services/EcoBridge/store/EcoBridge.selectors'
import { BridgeTransactionSummary } from '../bridgeTransactions/types'
import { AppDispatch, AppState } from '../index'
import { addTransaction } from './actions'
import { TransactionDetails } from './reducer'

export type SwaprTransactionResponse =
  | TransactionResponse
  | {
      hash: string
    }

interface TransactionAdderCustomData {
  summary?: string
  claim?: {
    recipient: string
  }
  approval?: {
    tokenAddress: string
    spender: string
  }
  swapProtocol?: string
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: SwaprTransactionResponse,
  customData?: TransactionAdderCustomData
) => void {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: SwaprTransactionResponse,
      { summary, approval, claim, swapProtocol }: TransactionAdderCustomData = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, chainId, approval, summary, claim, swapProtocol }))
    },
    [dispatch, chainId, account]
  )
}

type AllTransactions = { [hash: string]: TransactionDetails }

const addNetworkToTransaction = (transaction: AllTransactions, networkId: ChainId) => {
  const networkTransactions = cloneDeep(transaction ?? {})
  for (const transaction in networkTransactions) {
    networkTransactions[transaction]['network'] = networkId
  }
  return networkTransactions
}
// returns all the transactions for the current chain
export function useAllSwapTransactions(allNetwork = false): AllTransactions {
  const { chainId } = useActiveWeb3React()

  const allSwapTransactions = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  const allNetworkSwapTransactions = useMemo(() => {
    return (Object.keys(allSwapTransactions) as Array<unknown> as Array<ChainId>).reduce<AllTransactions>(
      (merged, networkId) => ({
        ...merged,
        ...addNetworkToTransaction(allSwapTransactions[networkId], networkId),
      }),
      {}
    )
  }, [allSwapTransactions])

  const networkSwapTransaction = useMemo(() => {
    return chainId ? addNetworkToTransaction(allSwapTransactions[chainId], chainId) ?? {} : {}
  }, [allSwapTransactions, chainId])
  // if allNetwork is true, return all transactions for all chains
  // otherwise, return only the transactions for the current chain
  return allNetwork ? allNetworkSwapTransactions : networkSwapTransaction
}

export function useAllBridgeTransactions(allNetwork = false): BridgeTransaction[] {
  const { chainId, account } = useActiveWeb3React()

  const allBridgeTransactions = useSelector<AppState, BridgeTransactionSummary[]>(state =>
    selectBridgeTransactions(state, account ?? undefined)
  )
  const allBridgeTransactionsFormatted = useMemo<BridgeTransaction[]>(
    () =>
      allBridgeTransactions?.map(transaction => {
        const {
          assetName,
          fromChainId,
          status,
          toChainId,
          value,
          pendingReason,
          log,
          timestampResolved,
          txHash,
          bridgeId,
        } = transaction

        return {
          type: TransactionBridgeTypes.Bridge,
          from: { value, token: assetName, chainId: fromChainId },
          to: { value, token: assetName, chainId: toChainId },
          confirmedTime: timestampResolved,
          hash: txHash,
          status,
          network: fromChainId,
          logs: log,
          pendingReason,
          bridgeId,
        }
      }),
    [allBridgeTransactions]
  )

  return useMemo(() => {
    return allNetwork
      ? allBridgeTransactionsFormatted
      : allBridgeTransactionsFormatted?.filter(txn => txn.network === chainId)
  }, [allBridgeTransactionsFormatted, allNetwork, chainId])
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllSwapTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllSwapTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(account?: string): {
  claimSubmitted: boolean
  claimTxn: TransactionDetails | undefined
} {
  const allTransactions = useAllSwapTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find(hash => {
      const tx = allTransactions[hash]
      return tx.claim && tx.claim.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
}
