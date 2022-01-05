import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import TabBar from '../../components/TabBar'
import List from '../../components/Pool/PairView/LiquidityMiningCampaigns/List'

import TabTitle from '../../components/Pool/PairView/LiquidityMiningCampaigns/TabTitle'
import { useAllLiquidtyMiningCampaings } from '../../hooks/useAllLiquidtyMiningCampaings'
import { RouteComponentProps } from 'react-router'
import { useToken } from '../../hooks/Tokens'
import { usePair } from '../../data/Reserves'

const View = styled(AutoColumn)`
  margin-top: 20px;
`

export default function Rewards({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const token0 = useToken(currencyIdA)

  const token1 = useToken(currencyIdB)
  const wrappedPair = usePair(token0 || undefined, token1 || undefined)
  const pair = wrappedPair[1]
  const { loading, singleSidedCampaings } = useAllLiquidtyMiningCampaings(pair ? pair : undefined)
  console.log(loading)
  console.log(singleSidedCampaings)
  const [activeTab, setActiveTab] = useState(0)

  return (
    <View gap="16px">
      <TabBar
        titles={[
          <TabTitle
            key="active"
            loadingAmount={loading}
            itemsAmount={singleSidedCampaings.active.length}
            badgeTheme="orange"
          >
            Campaigns
          </TabTitle>,
          <TabTitle
            key="active"
            loadingAmount={loading}
            itemsAmount={singleSidedCampaings.expired.length}
            badgeTheme="red"
          >
            Expired (30 days)
          </TabTitle>
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {!loading ? (
        <>
          {activeTab === 0 && <List loading={loading} items={singleSidedCampaings.active} />}
          {activeTab === 1 && <List loading={loading} items={singleSidedCampaings.expired} />}
        </>
      ) : (
        <List loading />
      )}
    </View>
  )
}
