import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { ChainId, CurrencyAmount } from '@swapr/sdk'
import { useDispatch, useSelector } from 'react-redux'

import { Tabs } from './Tabs'
import AppBody from '../AppBody'
import { AssetSelector } from './AssetsSelector'
import { RowBetween } from '../../components/Row'
import ArrowIcon from '../../assets/svg/arrow.svg'
import { BridgeActionPanel } from './ActionPanel/BridgeActionPanel'
import { BridgeModal } from './BridgeModals/BridgeModal'
import { BridgeTransactionsSummary } from './BridgeTransactionsSummary'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { NetworkSwitcher as NetworkSwitcherPopover, networkOptionsPreset } from '../../components/NetworkSwitcher'
import { useActiveWeb3React } from '../../hooks'
import { SHOW_TESTNETS } from '../../constants'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { BridgeTabs, isNetworkDisabled } from './utils'
import { createNetworksList, getNetworkOptions } from '../../utils/networksList'
import { useOmnibridge } from '../../services/Omnibridge/OmnibridgeProvider'
import { AppState } from '../../state'
import { selectAllTransactions } from '../../services/Omnibridge/store/Omnibridge.selectors'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'
import { BridgeSelectionWindow } from './BridgeSelectionWindow'
import CurrencyInputPanel from '../../components/CurrencyInputPanelBridge'
import { useBridgeModal } from './useBridgeModal'
import {
  useBridgeActionHandlers,
  useBridgeFetchDynamicLists,
  useBridgeInfo,
  useBridgeListsLoadingStatus,
  useBridgeTxsFilter
} from '../../services/Omnibridge/hooks/Omnibrige.hooks'
import { BridgeModalStatus, BridgeTxsFilter } from '../../services/Omnibridge/Omnibridge.types'

const Wrapper = styled.div`
  width: 100%;
  max-width: 432px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const Title = styled.p`
  margin: 0;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.purple2};
`

const Row = styled(RowBetween)`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  align-items: stretch;
  justify-content: space-between;

  @media (max-width: 374px) {
    flex-direction: column;
  }
`

const SwapButton = styled.button<{ disabled: boolean }>`
  padding: 0 16px;
  border: none;
  background: none;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  @media only screen and (max-width: 600px) {
    padding: 8px;
  }
`

const AssetWrapper = styled.div`
  flex: 1 0 35%;
`

export default function Bridge() {
  const dispatch = useDispatch()
  const { chainId, account } = useActiveWeb3React()
  const omnibridge = useOmnibridge()

  const bridgeSummaries = useSelector((state: AppState) => selectAllTransactions(state, account ? account : ''))

  useBridgeFetchDynamicLists()
  //new modal interface
  const { modalData, setModalData, setModalState } = useBridgeModal()
  const { bridgeCurrency, currencyBalance, parsedAmount, typedValue, fromChainId, toChainId } = useBridgeInfo()
  const {
    onCurrencySelection,
    onUserInput,
    onToNetworkChange,
    onFromNetworkChange,
    onSwapBridgeNetworks
  } = useBridgeActionHandlers()
  const listsLoading = useBridgeListsLoadingStatus()

  const [activeTab, setActiveTab] = useState<BridgeTabs>('bridge')
  const [collecting, setCollecting] = useState(false)

  const toPanelRef = useRef(null)
  const fromPanelRef = useRef(null)

  const [showToList, setShowToList] = useState(false)
  const [showFromList, setShowFromList] = useState(false)
  const [collectableTx, setCollectableTx] = useState(
    () => bridgeSummaries.filter(tx => tx.status === 'redeem')[0] || undefined
  )
  const setTxsFilter = useBridgeTxsFilter()

  const collectableTxAmount = bridgeSummaries.filter(tx => tx.status === 'redeem').length
  const isNetworkConnected = fromChainId === chainId
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalance, chainId)
  const atMaxAmountInput = Boolean((maxAmountInput && parsedAmount?.equalTo(maxAmountInput)) || !isNetworkConnected)

  useEffect(() => {
    const activeChain = chainId ?? ChainId.MAINNET

    if (collectableTx && collecting) {
      const { assetAddressL1, assetAddressL2, toChainId, fromChainId } = collectableTx
      onCurrencySelection(assetAddressL1 && assetAddressL2 ? assetAddressL1 : 'ETH')

      if (chainId !== fromChainId && chainId !== toChainId) {
        setCollecting(false)
      }
      return
    }
    // Reset input on network change
    onUserInput('')
    onCurrencySelection('')

    dispatch(omnibridgeUIActions.setFrom({ chainId: activeChain }))
    dispatch(
      omnibridgeUIActions.setTo({ chainId: activeChain === ChainId.MAINNET ? ChainId.ARBITRUM_ONE : ChainId.MAINNET })
    )
  }, [chainId, collectableTx, dispatch, collecting, onCurrencySelection, onUserInput])

  useEffect(() => {
    onCurrencySelection('')
  }, [fromChainId, onCurrencySelection, toChainId])

  const handleResetBridge = useCallback(() => {
    if (!chainId) return
    onUserInput('')
    onCurrencySelection('')
    setCollecting(false)
    setTxsFilter(BridgeTxsFilter.RECENT)
    setModalState(BridgeModalStatus.CLOSED)
    setModalData({
      symbol: '',
      typedValue: '',
      fromChainId: chainId,
      toChainId: chainId === ChainId.MAINNET ? ChainId.ARBITRUM_ONE : ChainId.MAINNET
    })
  }, [chainId, onCurrencySelection, onUserInput, setModalData, setModalState, setTxsFilter])

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(isNetworkConnected ? maxAmountInput.toExact() : '')
  }, [maxAmountInput, isNetworkConnected, onUserInput])

  const handleSubmit = useCallback(async () => {
    if (!chainId) return

    await omnibridge.triggerBridging()
  }, [chainId, omnibridge])

  const handleModal = useCallback(async () => {
    omnibridge.triggerModalDisclaimerText()
    setModalData({
      symbol: bridgeCurrency?.symbol,
      typedValue,
      fromChainId,
      toChainId
    })

    setModalState(BridgeModalStatus.DISCLAIMER)
  }, [omnibridge, setModalData, bridgeCurrency, typedValue, fromChainId, toChainId, setModalState])

  const handleTriggerCollect = useCallback(
    (tx: BridgeTransactionSummary) => {
      //FIX tmp solution because collect won't work for all txs
      if (tx.toChainId !== chainId && tx.fromChainId !== chainId) return

      onCurrencySelection(tx.assetAddressL1 && tx.assetAddressL2 ? tx.assetAddressL1 : 'ETH')
      const collectData = omnibridge.triggerCollect(tx)

      setCollecting(true)
      setCollectableTx(tx)

      if (collectData) {
        setModalData(collectData)
      }
    },
    [chainId, omnibridge, onCurrencySelection, setModalData]
  )

  const handleCollect = useCallback(async () => {
    await omnibridge.collect(collectableTx)
    setCollecting(false)
  }, [collectableTx, omnibridge])

  const fromNetworkList = useMemo(
    () =>
      createNetworksList({
        networkOptionsPreset,
        isNetworkDisabled,
        onNetworkChange: onFromNetworkChange,
        selectedNetworkChainId: fromChainId,
        activeChainId: !!account ? chainId : -1
      }),
    [account, chainId, fromChainId, onFromNetworkChange]
  )

  const toNetworkList = useMemo(
    () =>
      createNetworksList({
        networkOptionsPreset,
        isNetworkDisabled,
        onNetworkChange: onToNetworkChange,
        selectedNetworkChainId: toChainId,
        activeChainId: !!account ? chainId : -1
      }),
    [account, chainId, onToNetworkChange, toChainId]
  )

  return (
    <Wrapper>
      <Tabs
        collecting={collecting}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collectableTxAmount={collectableTxAmount}
        setTxsFilter={setTxsFilter}
        handleResetBridge={handleResetBridge}
      />
      {activeTab !== 'history' && (
        <AppBody>
          <RowBetween mb="12px">
            <Title>{collecting ? 'Collect' : 'Swapr Bridge'}</Title>
          </RowBetween>
          <Row mb="12px">
            <AssetWrapper ref={fromPanelRef}>
              <AssetSelector
                label="from"
                onClick={SHOW_TESTNETS ? () => setShowFromList(val => !val) : () => null}
                disabled={SHOW_TESTNETS ? activeTab === 'collect' : true}
                networkOption={getNetworkOptions({ chainId: fromChainId, networkList: fromNetworkList })}
              />
              <NetworkSwitcherPopover
                networksList={fromNetworkList}
                showWalletConnector={false}
                parentRef={fromPanelRef}
                show={SHOW_TESTNETS ? showFromList : false}
                onOuterClick={SHOW_TESTNETS ? () => setShowFromList(false) : () => null}
                placement="bottom"
              />
            </AssetWrapper>
            <SwapButton onClick={onSwapBridgeNetworks} disabled={activeTab === 'collect'}>
              <img src={ArrowIcon} alt="arrow" />
            </SwapButton>
            <AssetWrapper ref={toPanelRef}>
              <AssetSelector
                label="to"
                onClick={SHOW_TESTNETS ? () => setShowToList(val => !val) : () => null}
                disabled={SHOW_TESTNETS ? activeTab === 'collect' : true}
                networkOption={getNetworkOptions({ chainId: toChainId, networkList: toNetworkList })}
              />
              <NetworkSwitcherPopover
                networksList={toNetworkList}
                showWalletConnector={false}
                parentRef={toPanelRef}
                show={SHOW_TESTNETS ? showToList : false}
                onOuterClick={SHOW_TESTNETS ? () => setShowToList(false) : () => null}
                placement="bottom"
              />
            </AssetWrapper>
          </Row>
          {/* New component CurrencyInput for Bridge */}
          <CurrencyInputPanel
            label="Amount"
            value={activeTab === 'collect' ? (collecting ? collectableTx.value : '') : typedValue}
            showMaxButton={activeTab === 'collect' && !atMaxAmountInput}
            currency={bridgeCurrency}
            onUserInput={onUserInput}
            onMax={activeTab === 'collect' ? undefined : handleMaxInput}
            onCurrencySelect={onCurrencySelection}
            disableCurrencySelect={activeTab === 'collect' || !isNetworkConnected}
            disabled={activeTab === 'collect'}
            id="bridge-currency-input"
            hideBalance={
              activeTab === 'collect'
                ? collecting
                  ? ![collectableTx.fromChainId, collectableTx.toChainId].includes(chainId ?? 0)
                  : true
                : false
            }
            isBridge={true}
            isLoading={!!account && isNetworkConnected && listsLoading}
          />
          <BridgeActionPanel
            account={account}
            fromNetworkChainId={fromChainId}
            toNetworkChainId={collecting ? collectableTx.toChainId : toChainId}
            handleModal={handleModal}
            handleCollect={handleCollect}
            isNetworkConnected={isNetworkConnected}
            collecting={collecting}
            setCollecting={setCollecting}
          />
        </AppBody>
      )}
      {activeTab === 'bridge' && <BridgeSelectionWindow />}
      {!collecting && (
        <BridgeTransactionsSummary
          transactions={bridgeSummaries}
          collectableTx={collectableTx}
          handleTriggerCollect={handleTriggerCollect}
        />
      )}
      <BridgeModal
        handleResetBridge={handleResetBridge}
        setCollecting={setCollecting}
        setStatus={setModalState}
        modalData={modalData}
        handleSubmit={handleSubmit}
      />
    </Wrapper>
  )
}
