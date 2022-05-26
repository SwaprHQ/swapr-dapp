import React from 'react'
import styled from 'styled-components'
import { NumberBadge } from '../../components/NumberBadge'
import Row from '../../components/Row'
import { BridgeTxsFilter } from '../../services/EcoBridge/EcoBridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { BridgeTab } from './utils'

interface TabsProps {
  collectableTxAmount: number
  isCollecting: boolean
  handleResetBridge: () => void
  setTxsFilter: (filter: BridgeTxsFilter) => void
  activeTab: BridgeTab
  setActiveTab: (tab: BridgeTab) => void
  handleTriggerCollect: (tx: BridgeTransactionSummary) => void
  firstTxnToCollect?: BridgeTransactionSummary
}

export const Tabs = ({
  collectableTxAmount,
  isCollecting,
  handleResetBridge,
  setTxsFilter,
  activeTab,
  setActiveTab,
  handleTriggerCollect,
  firstTxnToCollect,
}: TabsProps) => {
  return (
    <TabsRow>
      <Button
        onClick={() => {
          if (isCollecting) {
            handleResetBridge()
            return
          }
          setActiveTab(BridgeTab.BRIDGE)
          setTxsFilter(BridgeTxsFilter.RECENT)
        }}
        className={activeTab === 'bridge' ? 'active' : ''}
      >
        Bridge
      </Button>
      <Button
        onClick={() => {
          if (!isCollecting && firstTxnToCollect) {
            handleTriggerCollect(firstTxnToCollect)
            setTxsFilter(BridgeTxsFilter.COLLECTABLE)
          }
        }}
        disabled={!firstTxnToCollect}
        className={activeTab === 'collect' ? 'active' : ''}
      >
        Collect
        {<Badge badgeTheme="green">{collectableTxAmount}</Badge>}
      </Button>
      <Button
        onClick={() => {
          handleResetBridge()
          setTxsFilter(BridgeTxsFilter.NONE)
          setActiveTab(BridgeTab.HISTORY)
        }}
        className={activeTab === 'history' ? 'active' : ''}
      >
        History
      </Button>
    </TabsRow>
  )
}

const TabsRow = styled(Row)`
  display: inline-flex;
  width: auto;
  margin: 0 0 10px;
  padding: 2px;
  background: ${({ theme }) => theme.bg8};
  border-radius: 12px;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 8.5px 10px;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text5};
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: ${({ theme }) => theme.bg2};
  }

  &:disabled {
    color: ${({ theme }) => theme.text6};
    cursor: not-allowed;
  }
`
const Badge = styled(NumberBadge)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 6px;
  font-size: 9px;
  letter-spacing: 0;
`
