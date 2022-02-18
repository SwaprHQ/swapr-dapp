import { Bridge, L1TokenData, L2TokenData, OutgoingMessageState } from 'arb-ts'
import { BigNumber, utils } from 'ethers'
import { JsonRpcSigner } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'

import { arbitrumSelectors } from './ArbitrumBridge.selectors'
import { addTransaction } from '../../../state/transactions/actions'
import { arbitrumActions } from './ArbitrumBridge.reducer'
import { setBridgeLoadingWithdrawals } from '../../../state/bridge/actions'

import { getChainPair, txnTypeToLayer } from '../../../utils/arbitrum'
import { OmnibridgeChildBase } from '../Omnibridge.utils'

import { BridgeModalStatus } from '../../../state/bridge/reducer'
import { BridgeAssetType, BridgeTransactionSummary, BridgeTxn } from '../../../state/bridgeTransactions/types'
import {
  OmnibridgeChangeHandler,
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  ArbitrumList
} from '../Omnibridge.types'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { parseUnits } from 'ethers/lib/utils'
import { migrateBridgeTransactions } from './ArbitrumBridge.utils'
import getTokenList from '../../../utils/getTokenList'
import { ARBITRUM_TOKEN_LISTS } from './ArbitrumBridge.lists'

const getErrorMsg = (error: any) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  return `Bridge failed: ${error.message}`
}

export class ArbitrumBridge extends OmnibridgeChildBase {
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

  constructor({ supportedChains, bridgeId, displayName = 'Arbitrum' }: OmnibridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })

    const { l1ChainId, l2ChainId } = getChainPair(this.supportedChains.from)

    if (!l1ChainId || !l2ChainId) throw new Error('ArbBridge: Wrong config')

    this.l1ChainId = l1ChainId
    this.l2ChainId = l2ChainId
  }

  // PRIMARY INTERFACE
  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: OmnibridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    // download token lists
    this.fetchTokenLists()

    // run migration
    migrateBridgeTransactions(this.store, this.actions, this.supportedChains)

    await this.setArbTs()

    this.startListeners()
    this.updatePendingWithdrawals()
  }

  public onSignerChange = async ({ previousChainId, ...signerData }: OmnibridgeChangeHandler) => {
    this.setSignerData(signerData)

    await this.setArbTs({ previousChainId })
    await this.updatePendingWithdrawals()
  }
  // TODO: check if it requres signer
  private deposit = async (value: string, tokenAddress: string) => {
    try {
      if (tokenAddress && tokenAddress !== 'ETH') {
        await this.depositERC20(tokenAddress, value)
      } else {
        await this.depositEth(value)
      }
    } catch (err) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }
  // TODO: check if it requres signer
  private withdraw = async (value: string, tokenAddress: string) => {
    try {
      if (tokenAddress && tokenAddress !== 'ETH') {
        await this.withdrawERC20(tokenAddress, value)
      } else {
        await this.withdrawEth(value)
      }
    } catch (err) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }
  // TODO: check if it requres signer
  public collect = async (l2Tx: BridgeTransactionSummary) => {
    const { batchIndex, batchNumber, value, assetAddressL2 } = l2Tx
    if (!this._account || !batchIndex || !batchNumber || !value) return

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    try {
      const batchNumberBN = BigNumber.from(batchNumber)
      const batchIndexBN = BigNumber.from(batchIndex)

      const l1Tx = await this.bridge.triggerL2ToL1Transaction(batchNumberBN, batchIndexBN, true)

      this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.COLLECTING }))

      this.store.dispatch(
        this.actions.addTx({
          assetName: assetAddressL2 ? l2Tx.assetName : 'ETH',
          assetType: assetAddressL2 ? BridgeAssetType.ERC20 : BridgeAssetType.ETH,
          type: 'outbox',
          value,
          txHash: l1Tx.hash,
          chainId: this.l1ChainId,
          sender: this._account
        })
      )

      this.store.dispatch(
        this.actions.updateTxPartnerHash({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          partnerTxHash: l2Tx.txHash,
          partnerChainId: this.l2ChainId
        })
      )

      const l1Receipt = await l1Tx.wait()

      this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.SUCCESS }))

      this.store.dispatch(
        this.actions.updateTxReceipt({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          receipt: l1Receipt
        })
      )

      this.store.dispatch(
        this.actions.updateTxWithdrawal({
          chainId: this.l1ChainId,
          txHash: l1Tx.hash,
          outgoingMessageState: OutgoingMessageState.EXECUTED
        })
      )
    } catch (err) {
      this.store.dispatch(
        omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.ERROR, error: getErrorMsg(err) })
      )
    }
  }

  public approve = async () => {
    if (!this._account) return

    const erc20L1Address = this.store.getState().omnibridge.UI.from.address
    if (!erc20L1Address) return

    const gatewayAddress = await this.bridge.l1Bridge.getGatewayAddress(erc20L1Address)

    const tokenSymbol = (await this.bridge.l1Bridge.getL1TokenData(erc20L1Address)).symbol

    const txn = await this.bridge.approveToken(erc20L1Address)

    this.store.dispatch(
      omnibridgeUIActions.setStatusButton({
        label: 'Approving',
        isError: false,
        isLoading: true,
        isBalanceSufficient: true,
        approved: false
      })
    )

    this.store.dispatch(
      addTransaction({
        hash: txn.hash,
        from: this._account,
        chainId: this.l1ChainId,
        approval: {
          spender: gatewayAddress,
          tokenAddress: erc20L1Address
        },
        summary: `Approve ${tokenSymbol.toUpperCase()}`
      })
    )

    const receipt = await txn.wait()
    if (receipt) {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({
          label: 'Bridge',
          isError: false,
          isLoading: false,
          isBalanceSufficient: true,
          approved: true
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
  private getReceipt = async (tx: BridgeTxn) => {
    const provider = txnTypeToLayer(tx.type) === 2 ? this.bridge?.l2Provider : this.bridge?.l1Provider
    if (!provider) throw new Error('No provider on bridge')

    return provider.getTransactionReceipt(tx.txHash)
  }

  private pendingTxListener = async () => {
    const pendingTransactions = this.selectors.selectPendingTxs(this.store.getState(), this._account)

    if (!pendingTransactions.length) return

    const receipts = await Promise.all(pendingTransactions.map(this.getReceipt))

    receipts.forEach((txReceipt, index) => {
      if (txReceipt) {
        this.store.dispatch(
          this.actions.updateTxReceipt({
            chainId: pendingTransactions[index].chainId,
            txHash: txReceipt.transactionHash,
            receipt: txReceipt
          })
        )
      }
    })
  }

  // L1 Deposit Listener
  private getL2TxnHash = async (txn: BridgeTxn) => {
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
      seqNum
    }
  }

  private l2DepositsListener = async () => {
    const allTransactions = this.selectors.selectOwnedTxs(this.store.getState(), this._account)
    const depositTransactions = this.selectors.selectL1Deposits(this.store.getState(), this._account)

    const depositHashes = await Promise.all(depositTransactions.map(this.getL2TxnHash))

    depositTransactions.forEach((txn, index) => {
      if (!this.l1ChainId || !this.l2ChainId) return
      const txnHash = depositHashes[index]
      if (txnHash === null) {
        return
      }

      const { retryableTicketHash, seqNum } = txnHash

      if (
        !allTransactions[this.l1ChainId]?.[retryableTicketHash] &&
        !allTransactions[this.l2ChainId]?.[retryableTicketHash]
      ) {
        this.store.dispatch(
          this.actions.addTx({
            ...txn,
            receipt: undefined,
            chainId: this.l2ChainId,
            type: 'deposit-l2',
            txHash: retryableTicketHash,
            seqNum: seqNum.toNumber(),
            blockNumber: undefined
          })
        )

        this.store.dispatch(
          this.actions.updateTxPartnerHash({
            chainId: this.l2ChainId,
            txHash: retryableTicketHash,
            partnerTxHash: txn.txHash,
            partnerChainId: this.l1ChainId
          })
        )
      }
    })
  }

  // Pending Withdrawals listener
  private getOutgoingMessageState = async (tx: BridgeTxn) => {
    const retVal: Partial<Pick<BridgeTxn, 'batchIndex' | 'batchNumber'>> &
      Pick<BridgeTxn, 'txHash' | 'outgoingMessageState'> = {
      batchNumber: tx.batchNumber,
      batchIndex: tx.batchIndex,
      outgoingMessageState: undefined,
      txHash: tx.txHash
    }

    if (!tx.receipt) {
      return retVal
    }
    if (!retVal.batchNumber || !retVal.batchIndex) {
      const l2ToL2EventData = await this.bridge.getWithdrawalsInL2Transaction(tx?.receipt)
      if (l2ToL2EventData.length === 1) {
        const { batchNumber, indexInBatch } = l2ToL2EventData[0]
        const outgoingMessageState = await this.bridge.getOutGoingMessageState(batchNumber, indexInBatch)
        retVal.batchIndex = indexInBatch.toHexString()
        retVal.batchNumber = batchNumber.toHexString()
        retVal.outgoingMessageState = outgoingMessageState
      }
    } else {
      const retValbatchNr = BigNumber.from(retVal.batchNumber)
      const retValbatchIndex = BigNumber.from(retVal.batchIndex)
      const outgoingMessageState = await this.bridge.getOutGoingMessageState(retValbatchNr, retValbatchIndex)
      retVal.outgoingMessageState = outgoingMessageState
    }

    return retVal
  }

  private updatePendingWithdrawals = async () => {
    if (this._initialPendingWithdrawalsChecked) return

    const pendingWithdrawals = this.selectors.selectPendingWithdrawals(this.store.getState(), this._account)

    this.store.dispatch(setBridgeLoadingWithdrawals(true))

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
            batchIndex: batchIndex,
            batchNumber: batchNumber
          })
        )
      }
    })

    this.store.dispatch(setBridgeLoadingWithdrawals(false))
    this._initialPendingWithdrawalsChecked = true
  }

  // Handlers
  private depositEth = async (value: string) => {
    if (!this._account) return

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))
    const weiValue = utils.parseEther(value)

    const txn = await this.bridge.depositETH(weiValue)

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

    this.store.dispatch(
      this.actions.addTx({
        assetName: 'ETH',
        assetType: BridgeAssetType.ETH,
        type: 'deposit-l1',
        value,
        txHash: txn.hash,
        chainId: this.l1ChainId,
        sender: this._account
      })
    )

    const l1Receipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l1ChainId,
        txHash: txn.hash,
        receipt: l1Receipt
      })
    )
  }

  private depositERC20 = async (erc20L1Address: string, typedValue: string) => {
    if (!this._account) return

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    const tokenData = await this.bridge.l1Bridge.getL1TokenData(erc20L1Address)

    if (!tokenData) {
      throw new Error('Token data not found')
    }

    const parsedValue = utils.parseUnits(typedValue, tokenData.decimals)

    const txn = await this.bridge.deposit({
      erc20L1Address,
      amount: parsedValue
    })

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))

    this.store.dispatch(
      this.actions.addTx({
        assetName: tokenData.symbol,
        assetType: BridgeAssetType.ERC20,
        type: 'deposit-l1',
        value: typedValue,
        txHash: txn.hash,
        chainId: this.l1ChainId,
        sender: this._account
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
        seqNum
      })
    )
  }

  private withdrawEth = async (value: string) => {
    if (!this._account) return

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    this.store.dispatch(
      omnibridgeUIActions.setBridgeModalData({
        symbol: 'ETH',
        typedValue: value,
        fromChainId: this.l2ChainId,
        toChainId: this.l1ChainId
      })
    )

    const weiValue = utils.parseEther(value)
    const txn = await this.bridge.withdrawETH(weiValue)

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
    this.store.dispatch(
      this.actions.addTx({
        assetName: 'ETH',
        assetType: BridgeAssetType.ETH,
        type: 'withdraw',
        value,
        txHash: txn.hash,
        chainId: this.l2ChainId,
        sender: this._account
      })
    )

    const withdrawReceipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: txn.hash,
        receipt: withdrawReceipt
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

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.PENDING }))

    this.store.dispatch(
      omnibridgeUIActions.setBridgeModalData({
        symbol: tokenData.symbol,
        typedValue: value,
        fromChainId: this.l2ChainId,
        toChainId: this.l1ChainId
      })
    )

    const weiValue = utils.parseUnits(value, tokenData.decimals)
    const txn = await this.bridge.withdrawERC20(erc20L1Address, weiValue)

    this.store.dispatch(omnibridgeUIActions.setBridgeModalStatus({ status: BridgeModalStatus.INITIATED }))
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
        sender: this._account
      })
    )

    const withdrawReceipt = await txn.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: txn.hash,
        receipt: withdrawReceipt
      })
    )
  }

  public triggerCollect = (l2Tx: BridgeTransactionSummary) => {
    return {
      symbol: l2Tx.assetName,
      typedValue: l2Tx.value,
      fromChainId: l2Tx.fromChainId,
      toChainId: l2Tx.toChainId
    }
  }

  private fetchTokenLists = async () => {
    const promises = ARBITRUM_TOKEN_LISTS.filter(config =>
      [this.l1ChainId.toString(), this.l2ChainId.toString()].includes(config.chainId)
    ).map(config => getTokenList(config.url, () => null as any))

    const tokenLists = (await Promise.allSettled(promises)).reduce<TokenList[]>((total, list) => {
      if (list.status === 'fulfilled') {
        total.push(list.value)
      }
      return total
    }, [])

    this.store.dispatch(this.actions.addTokenLists(tokenLists))
  }

  public validate = async () => {
    if (!this._account) return
    const { from } = this.store.getState().omnibridge.UI

    this.store.dispatch(
      omnibridgeUIActions.setStatusButton({
        label: 'Loading',
        isError: false,
        isLoading: true,
        isBalanceSufficient: false,
        approved: false
      })
    )

    if (from.address === 'ETH') {
      this.store.dispatch(
        omnibridgeUIActions.setStatusButton({
          label: 'Bridge',
          isError: false,
          isLoading: false,
          isBalanceSufficient: true,
          approved: true
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

      if (allowance && parsedValue.gt(allowance)) {
        this.store.dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Approve',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            approved: false
          })
        )
        return
      } else {
        this.store.dispatch(
          omnibridgeUIActions.setStatusButton({
            label: 'Bridge',
            isError: false,
            isLoading: false,
            isBalanceSufficient: true,
            approved: true
          })
        )
      }
    }
  }
  public triggerBridging = () => {
    const { value, address: tokenAddress } = this.store.getState().omnibridge.UI.from

    if (this.l1ChainId === this._activeChainId) {
      this.deposit(value, tokenAddress)
    } else {
      this.withdraw(value, tokenAddress)
    }
  }
}
