import { Provider } from '@ethersproject/abstract-provider'
import { JsonRpcSigner } from '@ethersproject/providers'
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units'
import { ChainId, Currency } from '@swapr/sdk'

import {
  Erc20Bridger,
  EthBridger,
  getL2Network,
  L1TransactionReceipt,
  L2ToL1MessageStatus,
  L2TransactionReceipt,
} from '@arbitrum/sdk'
import { ERC20 } from '@arbitrum/sdk/dist/lib/abi/ERC20'
import { L2GatewayToken } from '@arbitrum/sdk/dist/lib/abi/L2GatewayToken'
import { TokenList } from '@uniswap/token-lists'
import { BigNumber, Signer } from 'ethers'

import { ArbitrumBridgeTxn, BridgeAssetType, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { addTransaction } from '../../../state/transactions/actions'
import { getChainPair, txnTypeToLayer } from '../../../utils/arbitrum'
import { SWPRSupportedChains } from '../../../utils/chainSupportsSWPR'
import { formatGasOrFees } from '../../../utils/formatNumber'
import getTokenList from '../../../utils/getTokenList'
import {
  ArbitrumList,
  BridgeModalStatus,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  SyncState,
} from '../EcoBridge.types'
import { ButtonStatus, EcoBridgeChildBase, getNativeCurrencyPrice } from '../EcoBridge.utils'

import { arbitrumTransactionsAdapter } from './ArbitrumBridge.adapter'
import ARBITRUM_TOKEN_LISTS_CONFIG from './ArbitrumBridge.lists.json'
import { arbitrumActions } from './ArbitrumBridge.reducer'
import { arbitrumSelectors } from './ArbitrumBridge.selectors'
import { hasArbitrumMetadata } from './ArbitrumBridge.types'
import { migrateBridgeTransactions } from './ArbitrumBridge.utils'

export class ArbitrumBridge extends EcoBridgeChildBase {
  private l1ChainId: ChainId
  private l2ChainId: ChainId
  private _l1Signer: Signer | undefined
  private _l2Signer: Signer | undefined
  private _ethBridger: EthBridger | undefined
  private _erc20Bridger: Erc20Bridger | undefined
  private _initialPendingWithdrawalsChecked = false

  private get actions() {
    return arbitrumActions[this.bridgeId as ArbitrumList]
  }

  public get selectors() {
    return arbitrumSelectors[this.bridgeId as ArbitrumList]
  }

  public get ethBridger() {
    if (!this._ethBridger) throw this.ecoBridgeUtils.logger.error('ArbBridge: No Eth bridge set')
    return this._ethBridger
  }

  public get erc20Bridger() {
    if (!this._erc20Bridger) throw this.ecoBridgeUtils.logger.error('ArbBridge: No ERC20 bridge set')
    return this._erc20Bridger
  }

  // TODO: Handle exception throws properly over all the codebase.
  // uncaught exceptions can be thrown through the application
  // if we call some of the methods without setting up the classe's properties

  private get l1Signer() {
    if (!this._l1Signer) throw this.ecoBridgeUtils.logger.error('ArbBridge: No L1Signer set')
    return this._l1Signer
  }

  private get l2Signer() {
    if (!this._l2Signer) throw this.ecoBridgeUtils.logger.error('ArbBridge: No L2Signer set')
    return this._l2Signer
  }

  constructor({
    supportedChains: supportedChainsArr,
    bridgeId,
    displayName = 'Arbitrum',
    displayUrl,
  }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains: supportedChainsArr, bridgeId, displayName, displayUrl })
    this.setBaseActions(this.actions)

    if (supportedChainsArr.length !== 1) throw this.ecoBridgeUtils.logger.error(`${this.bridgeId}: Invalid config`)

    const [supportedChains] = supportedChainsArr

    const { l1ChainId, l2ChainId } = getChainPair(supportedChains.from)

    if (!l1ChainId || !l2ChainId) throw this.ecoBridgeUtils.logger.error(`${this.bridgeId}: Invalid config`)

    this.l1ChainId = l1ChainId
    this.l2ChainId = l2ChainId
  }

  // PRIMARY INTERFACE
  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: EcoBridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })

    migrateBridgeTransactions(this.store, this.actions, this.supportedChains[0])

    await this.setArbTs()

    this.ecoBridgeUtils.listeners.start([{ listener: this.l2DepositsListener }, { listener: this.pendingTxListener }])

    this.updatePendingWithdrawals()
  }

  public onSignerChange = async ({ previousChainId, ...signerData }: EcoBridgeChangeHandler) => {
    this.setSignerData(signerData)

    await this.setArbTs({ previousChainId })
    await this.updatePendingWithdrawals()
  }

  private deposit = async (value: string, tokenAddress: string) => {
    if (tokenAddress !== Currency.getNative(ChainId.MAINNET).symbol) {
      await this.depositERC20(tokenAddress, value)
    } else {
      await this.depositETH(value)
    }
  }

  private withdraw = async (value: string, tokenAddress: string) => {
    if (tokenAddress !== Currency.getNative(ChainId.ARBITRUM_ONE).symbol) {
      await this.withdrawERC20(tokenAddress, value)
    } else {
      await this.withdrawETH(value)
    }
  }

  public collect = async (l2Tx: BridgeTransactionSummary) => {
    try {
      const { fromValue, assetAddressL2, log } = l2Tx
      if (!this._account || !fromValue) return

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

      const txHash = log.find(transactionLog => transactionLog.chainId === this.l2ChainId)?.txHash

      if (!txHash || !this.l2Signer.provider) return

      const l1TransactionReceipt = arbitrumTransactionsAdapter
        .getSelectors()
        .selectById(this.store.getState().ecoBridge[this.bridgeId as ArbitrumList].transactions, txHash)?.receipt

      if (!l1TransactionReceipt) return

      const l2TransactionReceipt = new L2TransactionReceipt(l1TransactionReceipt)

      const [l2ToL1Msg] = await l2TransactionReceipt.getL2ToL1Messages(this.l1Signer)

      const l1CollectTransaction = await l2ToL1Msg.execute(this.l2Signer.provider)

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.COLLECTING)

      this.store.dispatch(
        this.actions.addTx({
          assetName: assetAddressL2 ? l2Tx.assetName : Currency.getNative(ChainId.MAINNET).symbol ?? 'ETH',
          assetType: assetAddressL2 ? BridgeAssetType.ERC20 : BridgeAssetType.ETH,
          type: 'outbox',
          value: fromValue,
          txHash: l1CollectTransaction.hash,
          chainId: this.l1ChainId,
          sender: this._account,
        })
      )

      this.store.dispatch(
        this.actions.updateTxPartnerHash({
          chainId: this.l1ChainId,
          txHash: l1CollectTransaction.hash,
          partnerTxHash: l2Tx.txHash,
          partnerChainId: this.l2ChainId,
        })
      )

      const l1Receipt = await l1CollectTransaction.wait()

      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.SUCCESS)

      this.store.dispatch(
        this.actions.updateTxReceipt({
          chainId: this.l1ChainId,
          txHash: l1CollectTransaction.hash,
          receipt: l1Receipt,
        })
      )

      this.store.dispatch(
        this.actions.updateTxWithdrawal({
          chainId: this.l1ChainId,
          txHash: l1CollectTransaction.hash,
          l2ToL1MessageStatus: L2ToL1MessageStatus.EXECUTED,
        })
      )
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  public approve = async () => {
    try {
      if (!this._account || !this.l1Signer.provider) return

      const { address: erc20L1Address, symbol: erc20L1Symbol } = this.store.getState().ecoBridge.ui.from

      const gatewayAddress = await this.erc20Bridger.getL1GatewayAddress(erc20L1Address, this.l1Signer.provider)

      const transaction = await this.erc20Bridger.approveToken({
        l1Signer: this.l1Signer,
        erc20L1Address,
      })

      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVING)

      this.store.dispatch(
        addTransaction({
          hash: transaction.hash,
          from: this._account,
          chainId: this.l1ChainId,
          approval: {
            spender: gatewayAddress,
            tokenAddress: erc20L1Address,
          },
          summary: `Approve ${erc20L1Symbol?.toUpperCase()}`,
        })
      )

      const receipt = await transaction.wait()

      if (receipt) {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  private setArbTs = async ({ previousChainId }: { previousChainId?: ChainId } = {}) => {
    if (!this._staticProviders || !this._activeChainId || !this._activeProvider) return

    let l1Signer: JsonRpcSigner | undefined = this._staticProviders[this.l1ChainId]?.getSigner(this._account)
    let l2Signer: JsonRpcSigner | undefined = this._staticProviders[this.l2ChainId]?.getSigner(this._account)

    if (!l1Signer || !l2Signer) throw this.ecoBridgeUtils.logger.error('No static provider found')

    const l2Network = await getL2Network(l2Signer)
    const chains = [this.l1ChainId, this.l2ChainId]

    if (
      this._erc20Bridger &&
      this._ethBridger &&
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

    this._l1Signer = l1Signer
    this._l2Signer = l2Signer

    try {
      this._erc20Bridger = new Erc20Bridger(l2Network)
      this._ethBridger = new EthBridger(l2Network)
    } catch (err) {
      throw this.ecoBridgeUtils.logger.error(err as string)
    }
  }

  // PendingTx Listener
  private getReceipt = async (tx: ArbitrumBridgeTxn) => {
    const provider = txnTypeToLayer(tx.type) === 2 ? this.l2Signer?.provider : this.l1Signer?.provider

    if (!provider) throw this.ecoBridgeUtils.logger.error('No provider on bridge')

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
    if (txn.receipt) {
      const [message] = await new L1TransactionReceipt(txn.receipt).getL1ToL2Messages(this.l2Signer)

      return {
        retryableTicketHash: message && message.retryableCreationId,
      }
    }
  }

  private l2DepositsListener = async () => {
    const allTransactions = this.selectors.selectOwnedTransactions(this.store.getState(), this._account)
    const depositTransactions = this.selectors.selectL1Deposits(this.store.getState(), this._account)

    const depositHashes = await Promise.all(depositTransactions.map(this.getL2TxnHash))

    depositTransactions.forEach((txn, index) => {
      if (!this.l1ChainId || !this.l2ChainId) return

      const txnHash = depositHashes[index]

      if (!txnHash) return

      const { retryableTicketHash } = txnHash

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
            txHash: retryableTicketHash ?? '',
            blockNumber: undefined,
          })
        )
        this.store.dispatch(
          this.actions.updateTxPartnerHash({
            chainId: this.l2ChainId,
            txHash: retryableTicketHash ?? '',
            partnerTxHash: txn.txHash,
            partnerChainId: this.l1ChainId,
          })
        )
      }
    })
  }

  // Pending Withdrawals listener
  private getL2ToL1MessageStatus = async (tx: ArbitrumBridgeTxn) => {
    const outbox: Pick<ArbitrumBridgeTxn, 'txHash' | 'l2ToL1MessageStatus'> = {
      l2ToL1MessageStatus: undefined,
      txHash: tx.txHash,
    }

    if (!tx.receipt) {
      return outbox
    }

    const l2Provider = this.l2Signer?.provider as Provider
    const l2Receipt = new L2TransactionReceipt(tx.receipt)
    const [message] = await l2Receipt.getL2ToL1Messages(this.l1Signer)

    outbox.l2ToL1MessageStatus = await message.status(l2Provider)

    return outbox
  }

  private updatePendingWithdrawals = async () => {
    if (this._initialPendingWithdrawalsChecked) return

    this.store.dispatch(this.ecoBridgeUIActions.setBridgeLoadingWithdrawals(true))

    const pendingWithdrawals = this.selectors.selectPendingWithdrawals(this.store.getState(), this._account)

    const promises = pendingWithdrawals.map(this.getL2ToL1MessageStatus)

    const withdrawalsInfo = await Promise.all(promises)

    withdrawalsInfo.forEach(withdrawalInfo => {
      if (!this.l2ChainId) return
      const { l2ToL1MessageStatus, txHash } = withdrawalInfo

      if (l2ToL1MessageStatus) {
        this.store.dispatch(
          this.actions.updateTxWithdrawal({
            chainId: this.l2ChainId,
            l2ToL1MessageStatus,
            txHash,
          })
        )
      }
    })

    this.store.dispatch(this.ecoBridgeUIActions.setBridgeLoadingWithdrawals(false))
    this._initialPendingWithdrawalsChecked = true
  }

  // Handlers
  private depositETH = async (value: string) => {
    if (!this._account || !this.l2Signer.provider) return

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

    const weiValue = parseEther(value)

    const txn = await this.ethBridger.deposit({
      l1Signer: this.l1Signer,
      amount: weiValue,
    })

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)

    this.store.dispatch(
      this.actions.addTx({
        assetName: Currency.getNative(ChainId.MAINNET).symbol ?? 'ETH',
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
    if (!this._account || !this.l2Signer.provider) return

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

    const { symbol: fromTokenSymbol, decimals: fromTokenDecimals } = this.store.getState().ecoBridge.ui.from

    const weiValue = parseUnits(typedValue, fromTokenDecimals)

    const transaction = await this.erc20Bridger.deposit({
      erc20L1Address,
      l1Signer: this.l1Signer,
      l2Provider: this.l2Signer.provider,
      amount: weiValue,
    })

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)

    this.store.dispatch(
      this.actions.addTx({
        assetName: fromTokenSymbol ?? '',
        assetType: BridgeAssetType.ERC20,
        type: 'deposit-l1',
        value: typedValue,
        txHash: transaction.hash,
        chainId: this.l1ChainId,
        sender: this._account,
      })
    )

    const l1Receipt = await transaction.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l1ChainId,
        txHash: transaction.hash,
        receipt: l1Receipt,
      })
    )
  }

  private withdrawETH = async (value: string) => {
    if (!this._account) return

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

    const weiValue = parseEther(value)
    const transaction = await this.ethBridger.withdraw({ l2Signer: this.l2Signer, amount: weiValue })

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)

    this.store.dispatch(
      this.actions.addTx({
        assetName: Currency.getNative(ChainId.ARBITRUM_ONE).symbol ?? 'ETH',
        assetType: BridgeAssetType.ETH,
        type: 'withdraw',
        value,
        txHash: transaction.hash,
        chainId: this.l2ChainId,
        sender: this._account,
      })
    )

    const withdrawReceipt = await transaction.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: transaction.hash,
        receipt: withdrawReceipt,
      })
    )
  }

  private withdrawERC20 = async (erc20L2Address: string, value: string) => {
    if (!this._account || !this.l2Signer.provider || !this.l1Signer?.provider) return

    const erc20L1Address = await this.erc20Bridger.getL1ERC20Address(erc20L2Address, this.l2Signer.provider)

    if (!erc20L1Address) throw this.ecoBridgeUtils.logger.error('Token address not recognized')

    const l1Token = this.erc20Bridger.getL1TokenContract(this.l1Signer.provider, erc20L1Address)

    if (!l1Token) throw this.ecoBridgeUtils.logger.error("Can't withdraw: token not found")

    const [symbol, decimals] = await Promise.all([l1Token.symbol(), l1Token.decimals()])

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.PENDING)

    const weiValue = parseUnits(value, decimals)
    const transaction = await this.erc20Bridger.withdraw({
      erc20l1Address: erc20L1Address,
      amount: weiValue,
      l2Signer: this.l2Signer,
    })

    this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.INITIATED)

    this.store.dispatch(
      this.actions.addTx({
        assetName: symbol,
        assetType: BridgeAssetType.ERC20,
        assetAddressL1: erc20L1Address,
        assetAddressL2: erc20L2Address,
        type: 'withdraw',
        value,
        txHash: transaction.hash,
        chainId: this.l2ChainId,
        sender: this._account,
      })
    )

    const withdrawReceipt = await transaction.wait()

    this.store.dispatch(
      this.actions.updateTxReceipt({
        chainId: this.l2ChainId,
        txHash: transaction.hash,
        receipt: withdrawReceipt,
      })
    )
  }

  public fetchStaticLists = async () => {
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.LOADING))

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

    this.store.dispatch(this.baseActions.addTokenLists(tokenLists))
    this.store.dispatch(this.baseActions.setTokenListsStatus(SyncState.READY))

    this.store.dispatch(this.commonActions.activateLists(defaultListsIds))
  }

  // No need to implement
  public fetchDynamicLists = async () => undefined

  public validate = async () => {
    try {
      if (!this._account || !this.l1Signer.provider || !this.l2Signer.provider) return

      const {
        address: fromTokenAddress,
        chainId: fromChainId,
        value: fromValue,
      } = this.store.getState().ecoBridge.ui.from

      this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.LOADING)

      if (fromTokenAddress === Currency.getNative(ChainId.MAINNET).symbol ?? 'ETH') {
        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
        return
      }

      if (fromTokenAddress !== Currency.getNative(ChainId.MAINNET).symbol ?? 'ETH') {
        let tokenContract: L2GatewayToken | ERC20
        if (fromChainId === this.l1ChainId) {
          tokenContract = this.erc20Bridger.getL1TokenContract(this.l1Signer.provider, fromTokenAddress)
        } else {
          tokenContract = this.erc20Bridger.getL2TokenContract(this.l2Signer.provider, fromTokenAddress)
        }

        const decimals = await tokenContract.decimals()

        const parsedValue = parseUnits(fromValue, decimals)

        //check allowance
        let gatewayAddress: string
        if (fromChainId === this.l1ChainId) {
          gatewayAddress = await this.erc20Bridger.getL1GatewayAddress(fromTokenAddress, this.l1Signer.provider)
        } else {
          gatewayAddress = await this.erc20Bridger.getL2GatewayAddress(fromTokenAddress, this.l2Signer.provider)
        }

        const allowance = await tokenContract.allowance(this._account, gatewayAddress)

        // Don't check allowance for l2 => l1
        if (fromChainId !== this.l2ChainId && allowance && parsedValue.gt(allowance)) {
          this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.APPROVE)
          return
        }

        this.ecoBridgeUtils.ui.statusButton.setStatus(ButtonStatus.BRIDGE)
      }
    } catch {
      this.ecoBridgeUtils.ui.statusButton.setError()
    }
  }
  public triggerBridging = () => {
    const { value, address: tokenAddress } = this.store.getState().ecoBridge.ui.from
    try {
      if (this.l1ChainId === this._activeChainId) {
        this.deposit(value, tokenAddress)
      } else {
        this.withdraw(value, tokenAddress)
      }
    } catch (error) {
      this.ecoBridgeUtils.ui.modal.setBridgeModalStatus(BridgeModalStatus.ERROR, this.bridgeId, error)
    }
  }

  public getBridgingMetadata = async () => {
    if (!this.l1Signer.provider || !this.l2Signer.provider || !this._activeChainId) return
    const requestId = this.ecoBridgeUtils.metadataStatus.start()

    const { value, decimals, address, chainId } = this.store.getState().ecoBridge.ui.from

    let parsedValue = BigNumber.from(0)
    //handling small amounts
    try {
      parsedValue = parseUnits(value, decimals)
    } catch (e) {
      this.ecoBridgeUtils.metadataStatus.fail('No available routes / details')
      return
    }

    let totalTxnGasCostInUSD: string | undefined

    try {
      const nativeCurrency = Currency.getNative(chainId).symbol

      let gas = BigNumber.from(0)
      let gasPrice = BigNumber.from(0)

      //calculate for deposit
      if (this._activeChainId === this.l1ChainId) {
        gasPrice = await this.l1Signer.provider.getGasPrice()

        if (address === nativeCurrency) {
          gas = await this.ethBridger.depositEstimateGas({
            amount: parsedValue,
            l1Signer: this.l1Signer,
          })
        } else {
          gas = await this.erc20Bridger.depositEstimateGas({
            l1Signer: this.l1Signer,
            l2Provider: this.l2Signer.provider,
            erc20L1Address: address,
            amount: parsedValue,
          })
        }
      }

      //calculate for withdraw
      if (this._activeChainId === this.l2ChainId) {
        gasPrice = await this.l2Signer.provider.getGasPrice()

        if (address === nativeCurrency) {
          gas = await this.ethBridger.withdrawEstimateGas({ l2Signer: this.l2Signer, amount: parsedValue })
        } else {
          const l1Address = await this.erc20Bridger.getL1ERC20Address(address, this.l2Signer.provider)
          if (l1Address) {
            gas = await this.erc20Bridger.withdrawEstimateGas({
              erc20l1Address: l1Address,
              l2Signer: this.l2Signer,
              amount: parsedValue,
            })
          }
        }
      }

      const nativeCurrencyPrice = await getNativeCurrencyPrice(this._activeChainId as SWPRSupportedChains)
      const totalTxnGasCostInWei = Number(gas) * Number(gasPrice) //gas units * gas price (wei)

      const totalTxnGasCostInEth = formatUnits(totalTxnGasCostInWei, 18)
      if (nativeCurrencyPrice !== 0) {
        totalTxnGasCostInUSD = formatGasOrFees(Number(totalTxnGasCostInEth) * nativeCurrencyPrice) // mul eth cost * eth price
      }
    } catch (e) {
      totalTxnGasCostInUSD = undefined //when Arbitrum cannot estimate gas
    }

    this.store.dispatch(
      this.baseActions.setBridgeDetails({
        gas: totalTxnGasCostInUSD,
        fee: '$0.00',
        estimateTime: this.l1ChainId === this._activeChainId ? '10 min' : '7 days',
        receiveAmount: Number(value).toFixed(this._receiveAmountDecimalPlaces).toString(),
        requestId,
      })
    )
  }
}
