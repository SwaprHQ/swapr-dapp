import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount } from '@swapr/sdk'
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
import { useBridgeInfo, useBridgeActionHandlers, useBridgeTxsFilter } from '../../state/bridge/hooks'
import { SHOW_TESTNETS } from '../../constants'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { BridgeTabs, isNetworkDisabled } from './utils'
import { BridgeTxsFilter } from '../../state/bridge/reducer'
import { BridgeModalStatus } from '../../state/bridge/reducer'
import { useChains } from '../../hooks/useChains'
import { createNetworksList, getNetworkOptions } from '../../utils/networksList'
import { setFromBridgeNetwork, setToBridgeNetwork } from '../../state/bridge/actions'
import { useOmnibridge } from '../../services/Omnibridge/OmnibridgeProvider'
import { AppState } from '../../state'
import { selectAllTransactions } from '../../services/Omnibridge/store/Omnibridge.selectors'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'
import { BridgeSelectionWindow } from './BridgeSelectionWindow'
import CurrencyInputPanel from '../../components/CurrencyInputPanelBridge'
import { useBridgeModal } from './useBridgeModal'
import {
  useBridgeFetchDynamicLists,
  useBridgeListsLoadingStatus
} from '../../services/Omnibridge/hooks/Omnibrige.hooks'

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
  const { account } = useActiveWeb3React()
  const omnibridge = useOmnibridge()

  const bridgeSummaries = useSelector((state: AppState) => selectAllTransactions(state, account ? account : ''))

  const { chainId, partnerChainId, isArbitrum } = useChains()

  useBridgeFetchDynamicLists()
  //new modal interface
  const { modalData, setModalData, setModalState } = useBridgeModal()
  const { bridgeCurrency, currencyBalance, parsedAmount, typedValue, fromNetwork, toNetwork } = useBridgeInfo()
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
  const [txsFilter, setTxsFilter] = useBridgeTxsFilter()

  const collectableTxAmount = bridgeSummaries.filter(tx => tx.status === 'redeem').length
  const isNetworkConnected = fromNetwork.chainId === chainId
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalance, chainId)
  const atMaxAmountInput = Boolean((maxAmountInput && parsedAmount?.equalTo(maxAmountInput)) || !isNetworkConnected)

  useEffect(() => {
    if (collectableTx && collecting) {
      // TODO: Remove
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

    //TODO: delete old redux stuff
    dispatch(setFromBridgeNetwork({ chainId }))
    dispatch(setToBridgeNetwork({ chainId: partnerChainId }))
    //Omnibridge UI reducer
    dispatch(omnibridgeUIActions.setFrom({ chainId: chainId ? chainId : 0 }))
    dispatch(omnibridgeUIActions.setTo({ chainId: partnerChainId }))
  }, [chainId, collectableTx, dispatch, isArbitrum, collecting, onCurrencySelection, onUserInput, partnerChainId])

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
      toChainId: chainId === 1 ? 42161 : 1
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
    setModalData({
      symbol: bridgeCurrency?.symbol,
      typedValue: typedValue,
      fromChainId: fromNetwork.chainId,
      toChainId: toNetwork.chainId
    })
    setModalState(BridgeModalStatus.DISCLAIMER)
  }, [bridgeCurrency, typedValue, fromNetwork.chainId, toNetwork.chainId, setModalData, setModalState])

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
        selectedNetworkChainId: fromNetwork.chainId,
        activeChainId: !!account ? chainId : -1
      }),
    [account, chainId, fromNetwork.chainId, onFromNetworkChange]
  )

  const toNetworkList = useMemo(
    () =>
      createNetworksList({
        networkOptionsPreset,
        isNetworkDisabled,
        onNetworkChange: onToNetworkChange,
        selectedNetworkChainId: toNetwork.chainId,
        activeChainId: !!account ? chainId : -1
      }),
    [account, chainId, onToNetworkChange, toNetwork.chainId]
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
                networkOption={getNetworkOptions({ chainId: fromNetwork.chainId, networkList: fromNetworkList })}
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
                networkOption={getNetworkOptions({ chainId: toNetwork.chainId, networkList: toNetworkList })}
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
            disableCurrencySelect={activeTab === 'collect'}
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
            isLoading={!!account && listsLoading}
          />
          <BridgeActionPanel
            account={account}
            fromNetworkChainId={fromNetwork.chainId}
            toNetworkChainId={collecting ? collectableTx.toChainId : toNetwork.chainId}
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
