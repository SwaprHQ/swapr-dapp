import { ChainId, Currency } from '@swapr/sdk'
import { BigNumber } from 'ethers'
import { TokenList } from '@uniswap/token-lists'
import { parseEther, parseUnits } from '@ethersproject/units'
import { JsonRpcSigner } from '@ethersproject/providers'
import { Bridge, BridgeHelper, L1TokenData, L2TokenData, OutgoingMessageState } from 'arb-ts'
import request from 'graphql-request'

import { arbitrumActions } from './ArbitrumBridge.reducer'
import { arbitrumSelectors } from './ArbitrumBridge.selectors'
import { getErrorMsg, migrateBridgeTransactions, QUERY_ETH_PRICE } from './ArbitrumBridge.utils'
import ARBITRUM_TOKEN_LISTS_CONFIG from './ArbitrumBridge.lists.json'
import { ecoBridgeUIActions } from '../store/UI.reducer'
import { commonActions } from '../store/Common.reducer'
import { addTransaction } from '../../../state/transactions/actions'
import { BridgeAssetType, BridgeTransactionSummary, ArbitrumBridgeTxn } from '../../../state/bridgeTransactions/types'
import getTokenList from '../../../utils/getTokenList'
import { getChainPair, txnTypeToLayer } from '../../../utils/arbitrum'
import { subgraphClientsUris } from '../../../apollo/client'
import {
  ArbitrumList,
  SyncState,
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
} from '../EcoBridge.types'
import { EcoBridgeChildBase } from '../EcoBridge.utils'
import { hasArbitrumMetadata } from './ArbitrumBridge.types'
import { formatUnits } from '@ethersproject/units'
import { MAX_SUBMISSION_PRICE_PERCENT_INCREASE } from './ArbitrumBridge.utils'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'

export class ArbitrumBridge extends EcoBridgeChildBase {
  private l1ChainId: ChainId
  private l2ChainId: ChainId
  private _bridge: Bridge | undefined
  private _initialPendingWithdrawalsChecked = false
  private _listeners: NodeJS.Timeout[] = []

  private get actions() {
    return arbitrumActions[this.bridgeId as ArbitrumList]
  }

  public get selectors() {
    return arbitrumSelectors[this.bridgeId as ArbitrumList]
  }
  // Typed setters
  public get bridge() {
    if (!this._bridge) throw new Error('ArbBridge: No bridge set')
    return this._bridge
  }

  private get store() {
    if (!this._store) throw new Error('ArbBridge: No store set')
    return this._store
  }

  constructor({
    supportedChains: supportedChainsArr,
    bridgeId,
    displayName = 'Arbitrum',
  }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName })

    if (supportedChainsArr.length !== 1) throw new Error('Invalid config')

    const [supportedChains] = supportedChainsArr

    const { l1ChainId, l2ChainId } = getChainPair(supportedChains.from)

    if (!l1ChainId || !l2ChainId) throw new Error('ArbBridge: Wrong config')

    this.l1ChainId = l1ChainId
    this.l2ChainId = l2ChainId
  }

  // PRIMARY INTERFACE
  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    migrateBridgeTransactions(this.store, this.actions, this.supportedChains[0])

    await this.setArbTs()

    this.startListeners()
    this.updatePendingWithdrawals()
  }

  public onSignerChange = async ({ previousChainId, ...signerData }: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)

    await this.setArbTs({ previousChainId })
    await this.updatePendingWithdrawals()
  }

  private deposit = async (value: string, tokenAddress: string) => {
    try {
      if (tokenAddress !== 'ETH') {
        await this.depositERC20(tokenAddress, value)
      } else {
        await this.depositETH(value)
      }
    } catch (err) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }

  private withdraw = async (value: string, tokenAddress: string) => {
    try {
      if (tokenAddress !== 'ETH') {
        await this.withdrawERC20(tokenAddress, value)
      } else {
        await this.withdrawETH(value)
      }
    } catch (err) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }

  public collect = async (l2Tx: BridgeTransactionSummary) => {
    const { batchIndex, batchNumber, value, assetAddressL2 } = l2Tx
    if (!this._account || !batchIndex || !batchNumber || !value) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    try {
      const batchNumberBN = BigNumber.from(batchNumber)
      const batchIndexBN = BigNumber.from(batchIndex)

      const l1Tx = await this.bridge.triggerL2ToL1Transaction(batchNumberBN, batchIndexBN, true)

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.COLLECTING }))

      this.store.dispatch(
        this.actions.addTx({
          assetName: assetAddressL2 ? l2Tx.assetName : 'ETH',
          assetType: assetAddressL2 ? BridgeAssetType.ERC20 : BridgeAssetType.ETH,
          type: 'outbox',
          value,
          txHash: l1Tx.hash,
          chainId: this.l1ChainId,
          sender: this._account,
        })
      )

      this.store.dispatch(
        this.actions.updateTxPartnerHash({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          partnerTxHash: l2Tx.txHash,
          partnerChainId: this.l2ChainId,
        })
      )

      const l1Receipt = await l1Tx.wait()

      this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.SUCCESS }))

      this.store.dispatch(
        this.actions.updateTxReceipt({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          receipt: l1Receipt,
        })
      )

      this.store.dispatch(
        this.actions.updateTxWithdrawal({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          outgoingMessageState: OutgoingMessageState.EXECUTED,
        })
      )
    } catch (err) {
      this.store.dispatch(
        ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }

  public approve = async () => {
    if (!this._account) return

    const erc20L1Address = this.store.getState().ecoBridge.ui.from.address
    if (!erc20L1Address) return

    const gatewayAddress = await this.bridge.l1Bridge.getGatewayAddress(erc20L1Address)

    const tokenSymbol = (await this.bridge.l1Bridge.getL1TokenData(erc20L1Address)).symbol

    const txn = await this.bridge.approveToken(erc20L1Address)

    this.store.dispatch(
      ecoBridgeUIActions.setStatusButton({
        label: 'Approving',
        isError: false,
        isLoading: true,
        isBalanceSufficient: true,
        isApproved: false,
      })
    )

    this.store.dispatch(
      addTransaction({
        hash: txn.hash,
        from: this._account,
        chainId: this.l1ChainId,
        approval: {
          spender: gatewayAddress,
          tokenAddress: erc20L1Address,
        },
        summary: `Approve ${tokenSymbol.toUpperCase()}`,
      })
    )

    const receipt = await txn.wait()
    if (receipt) {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Bridge',
          isError: false,
          isLoading: false,
          isBalanceSufficient: true,
          isApproved: true,
        })
      )
    }
  }

  private setArbTs = async ({ previousChainId }: { previousChainId?: ChainId } = {}) => {
    if (!this._staticProviders || !this._activeChainId || !this._activeProvider) return

    let l1Signer: JsonRpcSigner | undefined = this._staticProviders[this.l1ChainId]?.getSigner(this._account)
    let l2Signer: JsonRpcSigner | undefined = this._staticProviders[this.l2ChainId]?.getSigner(this._account)

    if (!l1Signer || !l2Signer) throw new Error('ArbBridge: No static provider found')

    const chains = [this.l1ChainId, this.l2ChainId]

    if (
      this._bridge &&
      !chains.includes(this._activeChainId) &&
      (!previousChainId || (previousChainId && !chains.includes(previousChainId)))
    )
      return

    if (this._activeChainId === this.l1ChainId) {
      l1Signer = this._activeProvider.getSigner()
    }

    if (this._activeChainId === this.l2ChainId) {
      l2Signer = this._activeProvider.getSigner()
    }

    try {
      this._bridge = await Bridge.init(l1Signer, l2Signer)
    } catch (err) {
      throw new Error('ArbBridge: ' + err)
    }
  }

  private startListeners = () => {
    this._listeners.push(setInterval(this.l2DepositsListener, 5000))
    this._listeners.push(setInterval(this.pendingTxListener, 5000))
  }

  // PendingTx Listener
  private getReceipt = async (tx: ArbitrumBridgeTxn) => {
    const provider = txnTypeToLayer(tx.type) === 2 ? this.bridge?.l2Provider : this.bridge?.l1Provider
    if (!provider) throw new Error('No provider on bridge')

    return provider.getTransactionReceipt(tx.txHash)
  }

  private pendingTxListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTransactions(this.store.getState(), this._account)

    if (!pendingTransactions.length) return

    const receipts = await Promise.all(pendingTransactions.map(this.getReceipt))

    receipts.forEach((txReceipt, index) => {
      if (txReceipt) {
        this.store.dispatch(
          this.actions.updateTxReceipt({
            chainId: pendingTransactions[index].chainId,
            txHash: txReceipt.transactionHash,
            receipt: txReceipt,
          })
        )
      }
    })
  }

  // L1 Deposit Listener
  private getL2TxnHash = async (txn: ArbitrumBridgeTxn) => {
    if (!this.bridge || !this.l2ChainId) {
      return null
    }
    let seqNum: BigNumber
    if (txn.seqNum) {
      seqNum = BigNumber.from(txn.seqNum)
    } else {
      const rec = await this.bridge.l1Provider.getTransactionReceipt(txn.txHash)
      if (!rec) return null
      const seqNumArray = await this.bridge.getInboxSeqNumFromContractTransaction(rec)

      if (!seqNumArray || seqNumArray.length === 0) {
        return null
      }
      ;[seqNum] = seqNumArray
    }
    const l2ChainIdBN = BigNumber.from(this.l2ChainId)
    const retryableTicketHash = await this.bridge.calculateL2TransactionHash(seqNum, l2ChainIdBN)

    return {
      retryableTicketHash,
      seqNum,
    }
  }

  private l2DepositsListener = async () => {
    const allTransactions = this.selectors.selectOwnedTransactions(this.store.getState(), this._account)
    const depositTransactions = this.selectors.selectL1Deposits(this.store.getState(), this._account)
    const depositHashes = await Promise.all(depositTransactions.map(this.getL2TxnHash))

    depositTransactions.forEach((txn, index) => {
      if (!this.l1ChainId || !this.l2ChainId) return
      const txnHash = depositHashes[index]
      if (txnHash === null) {
        return
      }

      const { retryableTicketHash, seqNum } = txnHash

      const l1ChainRetryableTicketHash = allTransactions.find(
        tx => tx.chainId === this.l1ChainId && tx.txHash === retryableTicketHash
      )
      const l2ChainRetryableTicketHash = allTransactions.find(
        tx => tx.chainId === this.l2ChainId && tx.txHash === retryableTicketHash
      )

      if (!l1ChainRetryableTicketHash && !l2ChainRetryableTicketHash) {
        this.store.dispatch(
          this.actions.addTx({
            ...txn,
            receipt: undefined,
            chainId: this.l2ChainId,
            type: 'deposit-l2',
            txHash: retryableTicketHash,
            seqNum: seqNum.toNumber(),
            blockNumber: undefined,
          })
        )
        this.store.dispatch(
          this.actions.updateTxPartnerHash({
            chainId: this.l2ChainId,
            txHash: retryableTicketHash,
            partnerTxHash: txn.txHash,
            partnerChainId: this.l1ChainId,
          })
        )
      }
    })
  }

  // Pending Withdrawals listener
  private getOutgoingMessageState = async (tx: ArbitrumBridgeTxn) => {
    const outbox: Partial<Pick<ArbitrumBridgeTxn, 'batchIndex' | 'batchNumber'>> &
      Pick<ArbitrumBridgeTxn, 'txHash' | 'outgoingMessageState'> = {
      batchNumber: tx.batchNumber,
      batchIndex: tx.batchIndex,
      outgoingMessageState: undefined,
      txHash: tx.txHash,
    }

    if (!tx.receipt) {
      return outbox
    }
    if (!outbox.batchNumber || !outbox.batchIndex) {
      const l2ToL2EventData = await this.bridge.getWithdrawalsInL2Transaction(tx?.receipt)
      if (l2ToL2EventData.length === 1) {
        const { batchNumber, indexInBatch } = l2ToL2EventData[0]
        const outgoingMessageState = await this.bridge.getOutGoingMessageState(batchNumber, indexInBatch)
        outbox.batchIndex = indexInBatch.toHexString()
        outbox.batchNumber = batchNumber.toHexString()
        outbox.outgoingMessageState = outgoingMessageState
      }
    } else {
      const batchNumber = BigNumber.from(outbox.batchNumber)
      const batchIndex = BigNumber.from(outbox.batchIndex)
      const outgoingMessageState = await this.bridge.getOutGoingMessageState(batchNumber, batchIndex)
      outbox.outgoingMessageState = outgoingMessageState
    }

    return outbox
  }

  private updatePendingWithdrawals = async () => {
    if (this._initialPendingWithdrawalsChecked) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeLoadingWithdrawals(true))

    const pendingWithdrawals = this.selectors.selectPendingWithdrawals(this.store.getState(), this._account)

    const promises = pendingWithdrawals.map(this.getOutgoingMessageState)

    const withdrawalsInfo = await Promise.all(promises)
    withdrawalsInfo.forEach(withdrawalInfo => {
      if (!this.l2ChainId) return
      const { outgoingMessageState, batchNumber, batchIndex, txHash } = withdrawalInfo

      if (outgoingMessageState !== undefined) {
        this.store.dispatch(
          this.actions.updateTxWithdrawal({
            chainId: this.l2ChainId,
            outgoingMessageState,
            txHash,
            batchIndex,
            batchNumber,
          })
        )
      }
    })

    this.store.dispatch(ecoBridgeUIActions.setBridgeLoadingWithdrawals(false))
    this._initialPendingWithdrawalsChecked = true
  }

  // Handlers
  private depositETH = async (value: string) => {
    if (!this._account) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))
    const weiValue = parseEther(value)

    const txn = await this.bridge.depositETH(weiValue)

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

    this.store.dispatch(
      this.actions.addTx({
        assetName: 'ETH',
        assetType: BridgeAssetType.ETH,
        type: 'deposit-l1',
        value,
        txHash: txn.hash,
        chainId: this.l1ChainId,
        sender: this._account,
      })
    )

    const l1Receipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l1ChainId,
        txHash: txn.hash,
        receipt: l1Receipt,
      })
    )
  }

  private depositERC20 = async (erc20L1Address: string, typedValue: string) => {
    if (!this._account) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const tokenData = await this.bridge.l1Bridge.getL1TokenData(erc20L1Address)

    if (!tokenData) {
      throw new Error('Token data not found')
    }

    const parsedValue = parseUnits(typedValue, tokenData.decimals)

    const txn = await this.bridge.deposit({
      erc20L1Address,
      amount: parsedValue,
    })

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

    this.store.dispatch(
      this.actions.addTx({
        assetName: tokenData.symbol,
        assetType: BridgeAssetType.ERC20,
        type: 'deposit-l1',
        value: typedValue,
        txHash: txn.hash,
        chainId: this.l1ChainId,
        sender: this._account,
      })
    )

    const l1Receipt = await txn.wait()
    const seqNums = await this.bridge.getInboxSeqNumFromContractTransaction(l1Receipt)
    if (!seqNums) return

    const seqNum = seqNums[0].toNumber()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l1ChainId,
        txHash: txn.hash,
        receipt: l1Receipt,
        seqNum,
      })
    )
  }

  private withdrawETH = async (value: string) => {
    if (!this._account) return

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    this.store.dispatch(
      ecoBridgeUIActions.setBridgeModalData({
        symbol: 'ETH',
        typedValue: value,
        fromChainId: this.l2ChainId,
        toChainId: this.l1ChainId,
      })
    )

    const weiValue = parseEther(value)
    const txn = await this.bridge.withdrawETH(weiValue)

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
    this.store.dispatch(
      this.actions.addTx({
        assetName: 'ETH',
        assetType: BridgeAssetType.ETH,
        type: 'withdraw',
        value,
        txHash: txn.hash,
        chainId: this.l2ChainId,
        sender: this._account,
      })
    )

    const withdrawReceipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: txn.hash,
        receipt: withdrawReceipt,
      })
    )
  }

  private withdrawERC20 = async (erc20L2Address: string, value: string) => {
    if (!this._account) return

    const erc20L1Address = await this.bridge.l2Bridge.getERC20L1Address(erc20L2Address)
    if (!erc20L1Address) {
      throw new Error('Token address not recognized')
    }

    const tokenData = await this.bridge.l1Bridge.getL1TokenData(erc20L1Address)
    if (!tokenData) {
      throw new Error("Can't withdraw; token not found")
    }

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    this.store.dispatch(
      ecoBridgeUIActions.setBridgeModalData({
        symbol: tokenData.symbol,
        typedValue: value,
        fromChainId: this.l2ChainId,
        toChainId: this.l1ChainId,
      })
    )

    const weiValue = parseUnits(value, tokenData.decimals)
    const txn = await this.bridge.withdrawERC20(erc20L1Address, weiValue)

    this.store.dispatch(ecoBridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
    this.store.dispatch(
      this.actions.addTx({
        assetName: tokenData.symbol,
        assetType: BridgeAssetType.ERC20,
        assetAddressL1: erc20L1Address,
        assetAddressL2: erc20L2Address,
        type: 'withdraw',
        value,
        txHash: txn.hash,
        chainId: this.l2ChainId,
        sender: this._account,
      })
    )

    const withdrawReceipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: txn.hash,
        receipt: withdrawReceipt,
      })
    )
  }

  public fetchStaticLists = async () => {
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.LOADING))

    const ownedTokenLists = ARBITRUM_TOKEN_LISTS_CONFIG.lists.filter(config =>
      [this.l1ChainId, this.l2ChainId].includes(config.chainId)
    )

    const defaultListsUrls = ownedTokenLists.filter(configList => configList.isDefault)

    const promises = ownedTokenLists.map(config => getTokenList(config.url, () => null as any))

    const fetchedTokenListsWithUrl = (await Promise.allSettled(promises)).map((fulfilledList, index) => {
      const listWithUrl: { url: string; tokenList?: TokenList } = {
        url: ownedTokenLists[index].url,
        tokenList: undefined,
      }

      if (fulfilledList.status === 'fulfilled') {
        listWithUrl.tokenList = fulfilledList.value
      }

      return listWithUrl
    })

    const { tokenLists, defaultListsIds } = fetchedTokenListsWithUrl.reduce<{
      tokenLists: { [id: string]: TokenList }
      defaultListsIds: string[]
    }>(
      (total, listWithUrl) => {
        if (!listWithUrl.tokenList) return total

        const l2Tokens = listWithUrl.tokenList.tokens.filter(token => token.chainId === this.l2ChainId)
        const l1Tokens = l2Tokens.reduce<typeof l2Tokens>((tokens, l2Token) => {
          if (hasArbitrumMetadata(l2Token, this.l1ChainId)) {
            const castedL1ChainId = Number(this.l1ChainId)
            const l1Token: typeof l2Token = {
              ...l2Token,
              chainId: castedL1ChainId,
              address: l2Token.extensions.bridgeInfo[castedL1ChainId].tokenAddress,
            }
            tokens.push(l1Token)
          }
          return tokens
        }, [])

        const listId = `${this.bridgeId}-${listWithUrl.tokenList.name}`

        total.tokenLists[listId] = {
          ...listWithUrl.tokenList,
          tokens: [...l1Tokens, ...l2Tokens],
        }

        if (defaultListsUrls.findIndex(configList => configList.url === listWithUrl.url) > -1) {
          total.defaultListsIds.push(listId)
        }

        return total
      },
      { tokenLists: {}, defaultListsIds: [] }
    )

    this.store.dispatch(this.actions.addTokenLists(tokenLists))
    this.store.dispatch(this.actions.setTokenListsStatus(SyncState.READY))
    this.store.dispatch(commonActions.activateLists(defaultListsIds))
  }

  // No need to implement
  public fetchDynamicLists = async () => undefined

  public validate = async () => {
    if (!this._account) return

    const { from } = this.store.getState().ecoBridge.ui

    this.store.dispatch(
      ecoBridgeUIActions.setStatusButton({
        label: 'Loading',
        isError: false,
        isLoading: true,
        isBalanceSufficient: false,
        isApproved: false,
      })
    )

    if (from.address === 'ETH') {
      this.store.dispatch(
        ecoBridgeUIActions.setStatusButton({
          label: 'Bridge',
          isError: false,
          isLoading: false,
          isBalanceSufficient: true,
          isApproved: true,
        })
      )
    }

    if (from.address !== 'ETH') {
      let response: L1TokenData | L2TokenData
      if (from.chainId === this.l1ChainId) {
        response = await this.bridge.l1Bridge.getL1TokenData(from.address)
      } else {
        response = await this.bridge.l2Bridge.getL2TokenData(from.address)
      }

      const { contract } = response

      const [decimals] = await Promise.all([contract.decimals()])

      const parsedValue = parseUnits(from.value, decimals)

      //check allowance
      let gatewayAddress: string
      if (from.chainId === this.l1ChainId) {
        gatewayAddress = await this.bridge.l1Bridge.getGatewayAddress(from.address)
      } else {
        gatewayAddress = await this.bridge.l2Bridge.getGatewayAddress(from.address)
      }

      const allowance = await contract.allowance(this._account, gatewayAddress)

      // Don't check allowance for l2 => l1
      if (from.chainId !== this.l2ChainId && allowance && parsedValue.gt(allowance)) {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Approve',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: false,
          })
        )
        return
      } else {
        this.store.dispatch(
          ecoBridgeUIActions.setStatusButton({
            label: 'Bridge',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            isApproved: true,
          })
        )
      }
    }
  }
  public triggerBridging = () => {
    const { value, address: tokenAddress } = this.store.getState().ecoBridge.ui.from

    if (this.l1ChainId === this._activeChainId) {
      this.deposit(value, tokenAddress)
    } else {
      this.withdraw(value, tokenAddress)
    }
  }
  public getBridgingMetadata = async () => {
    const requestId = this.store.getState().ecoBridge[this.bridgeId as ArbitrumList].lastMetadataCt

    const helperRequestId = (requestId ?? 0) + 1

    this.store.dispatch(this.actions.requestStarted({ id: helperRequestId }))

    this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

    const { value, decimals, address, chainId } = this.store.getState().ecoBridge.ui.from

    let parsedValue = BigNumber.from(0)
    //handling small amounts
    try {
      parsedValue = parseUnits(value, decimals)
    } catch (e) {
      this.store.dispatch(
        this.actions.setBridgeDetailsStatus({
          status: SyncState.FAILED,
          errorMessage: 'No available routes / details',
        })
      )
      return
    }

    let totalTxnGasCostInUSD: string | undefined = undefined

    try {
      const nativeCurrency = Currency.getNative(chainId).symbol

      let gas = BigNumber.from(0)
      let gasPrice = BigNumber.from(0)

      //calculate for deposit
      if (this._activeChainId === this.l1ChainId) {
        gasPrice = await this.bridge.l1Provider.getGasPrice()
        if (address === nativeCurrency) {
          const maxSubmissionPrice = BridgeHelper.percentIncrease(
            (await this.bridge.l2Bridge.getTxnSubmissionPrice(0))[0],
            MAX_SUBMISSION_PRICE_PERCENT_INCREASE
          )
          gas = await this.bridge.l1Bridge.estimateGasDepositEth(parsedValue, maxSubmissionPrice)
        } else {
          gas = await this.bridge.estimateGasDeposit({ erc20L1Address: address, amount: parsedValue }) //this method under the hood calls this.bridge.l1Bridge
        }
      }

      //calculate for withdraw
      if (this._activeChainId === this.l2ChainId) {
        gasPrice = await this.bridge.l2Provider.getGasPrice()
        if (address === nativeCurrency) {
          gas = await this.bridge.l2Bridge.estimateGasWithdrawETH(parsedValue)
        } else {
          const l1Address = await this.bridge.l2Bridge.getERC20L1Address(address)
          if (l1Address) {
            gas = await this.bridge.l2Bridge.estimateGasWithdrawERC20(l1Address, parsedValue)
          }
        }
      }

      if (!this._activeChainId) {
        this.store.dispatch(this.actions.setBridgeDetailsStatus({ status: SyncState.FAILED }))
        return
      }

      const {
        bundle: { nativeCurrencyPrice },
      } = await request(subgraphClientsUris[this._activeChainId as SWPRSupportedChains], QUERY_ETH_PRICE)

      const totalTxnGasCostInWei = Number(gas) * Number(gasPrice) //gas units * gas price (wei)

      const totalTxnGasCostInEth = formatUnits(totalTxnGasCostInWei, 18)

      totalTxnGasCostInUSD = `${(Number(totalTxnGasCostInEth) * Number(nativeCurrencyPrice)).toFixed(2)}$` // mul eth cost * eth price
    } catch (e) {
      totalTxnGasCostInUSD = undefined //when Arbitrum cannot estimate gas
    }

    this.store.dispatch(
      this.actions.setBridgeDetails({
        gas: totalTxnGasCostInUSD,
        fee: '0%',
        estimateTime: this.l1ChainId === this._activeChainId ? '10 min' : '7 days',
        receiveAmount: Number(value)
          .toFixed(2)
          .toString(),
        requestId: helperRequestId,
      })
    )
  }
}
