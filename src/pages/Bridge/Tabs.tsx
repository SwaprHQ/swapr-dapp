import React from 'react'
import styled from 'styled-components'
import { NumberBadge } from '../../components/NumberBadge'
import Row from '../../components/Row'
import { BridgeTxsFilter } from '../../services/Omnibridge/Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { BridgeTabs } from './utils'

interface TabsProps {
  collectableTxAmount: number
  collecting: boolean
  handleResetBridge: () => void
  setTxsFilter: (filter: BridgeTxsFilter) => void
  activeTab: BridgeTabs
  setActiveTab: (tab: BridgeTabs) => void
  handleTriggerCollect: (tx: BridgeTransactionSummary) => void
  firstTxnToCollect: BridgeTransactionSummary
}

export const Tabs = ({
  collectableTxAmount,
  collecting,
  handleResetBridge,
  setTxsFilter,
  activeTab,
  setActiveTab,
  handleTriggerCollect,
  firstTxnToCollect
}: TabsProps) => {
  return (
    <TabsRow>
      <Button
        onClick={() => {
          if (collecting) {
            handleResetBridge()
            return
          }
          setActiveTab('bridge')
          setTxsFilter(BridgeTxsFilter.RECENT)
        }}
        className={activeTab === 'bridge' ? 'active' : ''}
      >
        Bridge
      </Button>
      <Button
        onClick={() => {
          handleTriggerCollect(firstTxnToCollect)
          setTxsFilter(BridgeTxsFilter.COLLECTABLE)
        }}
        className={activeTab === 'collect' ? 'active' : ''}
        disabled={collecting}
      >
        Collect
        {<Badge badgeTheme="green">{collectableTxAmount}</Badge>}
      </Button>
      <Button
        onClick={() => {
          setTxsFilter(BridgeTxsFilter.NONE)
          setActiveTab('history')
        }}
        className={activeTab === 'history' ? 'active' : ''}
        disabled={collecting}
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
  background: #191a24;
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
  color: #8780bf;
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: #2a2f42;
  }

  &:disabled {
    color: #504d72;
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
