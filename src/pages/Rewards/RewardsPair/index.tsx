import { DateTime, Duration } from 'luxon'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { usePairCampaigns } from '../../../hooks/singleSidedStakeCampaigns/usePairCampaigns'
import { useLiquidityMiningCampaignsForPair } from '../../../hooks/useLiquidityMiningCampaignsForPair'
import { AutoColumn } from '../../../components/Column'
import TabBar from '../../../components/TabBar'
import List from '../../../components/Pool/PairView/LiquidityMiningCampaigns/List'

import TabTitle from '../../../components/Pool/PairView/LiquidityMiningCampaigns/TabTitle'
import { RouteComponentProps } from 'react-router'
import { useToken } from '../../../hooks/Tokens'
import { usePair } from '../../../data/Reserves'

const View = styled(AutoColumn)`
  margin-top: 20px;
`

export default function RewardsPair({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const token0 = useToken(currencyIdA)
  const token1 = useToken(currencyIdB)

  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const pair = wrappedPair[1]
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
  } = useLiquidityMiningCampaignsForPair(pair ? pair : undefined, lowerExpiredCampaignTimeLimit)
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
            <List loading={loadingActive || loading} items={[...active, ...activeWrappedCampaigns]} />
          )}
          {activeTab === 1 && (
            <List loading={expiredLoading || loading} items={[...expired, ...expiredWrappedCampagins]} />
          )}
        </>
      ) : (
        <List loading />
      )}
    </View>
  )
}
