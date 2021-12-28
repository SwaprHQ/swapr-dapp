import { Pair } from '@swapr/sdk'
import { DateTime, Duration } from 'luxon'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { usePairCampaigns } from '../../../../hooks/singleSidedStakeCampaigns/usePairCampaigns'
import { useLiquidityMiningCampaignsForPair } from '../../../../hooks/useLiquidityMiningCampaignsForPair'
import { AutoColumn } from '../../../Column'
import TabBar from '../../../TabBar'
import List from './List'
import TabTitle from './TabTitle'

const View = styled(AutoColumn)`
  margin-top: 20px;
`

interface LiquidityMiningCampaignsListProps {
  pair?: Pair
}

export default function LiquidityMiningCampaigns({ pair }: LiquidityMiningCampaignsListProps) {
  const lowerExpiredCampaignTimeLimit = useMemo(
    () =>
      DateTime.utc()
        .minus(Duration.fromObject({ days: 30 }))
        .toJSDate(),
    []
  )
  const {
    loading: loadingActive,
    wrappedCampaigns: activeWrappedCampaigns,
    expiredLoading,
    expiredWrappedCampagins
  } = useLiquidityMiningCampaignsForPair(pair, lowerExpiredCampaignTimeLimit)
  const { active, expired, loading } = usePairCampaigns(pair?.token0.address, pair?.token1.address)

  const [activeTab, setActiveTab] = useState(0)

  return (
    <View gap="16px">
      <TabBar
        titles={[
          <TabTitle
            key="active"
            loadingAmount={!!(!pair || loadingActive)}
            itemsAmount={activeWrappedCampaigns.length + active.length}
            badgeTheme="orange"
          >
            Campaigns
          </TabTitle>,
          <TabTitle
            key="active"
            loadingAmount={!!(!pair || expiredLoading)}
            itemsAmount={expiredWrappedCampagins.length + expired.length}
            badgeTheme="red"
          >
            Expired (30 days)
          </TabTitle>
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {pair ? (
        <>
          {activeTab === 0 && (
            <List
              loading={loadingActive || loading}
              stakablePair={pair}
              items={[...active, ...activeWrappedCampaigns]}
            />
          )}
          {activeTab === 1 && (
            <List
              loading={expiredLoading || loading}
              stakablePair={pair}
              items={[...expired, ...expiredWrappedCampagins]}
            />
          )}
        </>
      ) : (
        <List loading />
      )}
    </View>
  )
}
