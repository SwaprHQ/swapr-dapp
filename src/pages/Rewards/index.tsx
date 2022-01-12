import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import TabBar from '../../components/TabBar'
import List from '../../components/Pool/PairView/LiquidityMiningCampaigns/List'

import TabTitle from '../../components/Pool/PairView/LiquidityMiningCampaigns/TabTitle'
import { useAllLiquidtyMiningCampaings } from '../../hooks/useAllLiquidtyMiningCampaings'

import { PairsFilterType } from '../../components/Pool/ListFilter'
import { Pair } from '@swapr/sdk'
import { Flex } from 'rebass'
import Switch from '../../components/Switch'

const View = styled(AutoColumn)`
  margin-top: 20px;
`
interface RewardsInterface {
  dataFilter: PairsFilterType
  setDataFiler: any
  pair?: Pair | null
}

export default function Rewards({ dataFilter, pair, setDataFiler }: RewardsInterface) {
  const { loading, singleSidedCampaings } = useAllLiquidtyMiningCampaings(pair ? pair : undefined)
  console.log(pair)
  const [activeTab, setActiveTab] = useState(0)

  return (
    <View gap="16px">
      <Flex>
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
        <Switch
          style={{ marginLeft: 'auto' }}
          isOn={dataFilter === PairsFilterType.MY}
          label="MY PAIRS"
          handleToggle={() => setDataFiler(PairsFilterType.MY)}
        />
      </Flex>

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
