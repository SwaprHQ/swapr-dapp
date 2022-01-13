import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../../components/Column'
import TabBar from '../../../components/TabBar'
import List from '../../../components/Pool/PairView/LiquidityMiningCampaigns/List'

import TabTitle from '../../../components/Pool/PairView/LiquidityMiningCampaigns/TabTitle'
import { useAllLiquidtyMiningCampaings } from '../../../hooks/useAllLiquidtyMiningCampaings'

import { PairsFilterType } from '../../../components/Pool/ListFilter'
import { Pair } from '@swapr/sdk'
import { Flex } from 'rebass'
import Switch from '../../../components/Switch'

const View = styled(AutoColumn)`
  margin-top: 20px;
`
interface RewardsInterface {
  dataFilter: PairsFilterType
  setDataFiler: any
  pair?: Pair | null
  loading: boolean
}

export default function RewardsList({ dataFilter, pair, setDataFiler, loading }: RewardsInterface) {
  const { loading: loadingPairs, singleSidedCampaings } = useAllLiquidtyMiningCampaings(
    pair ? pair : undefined,
    dataFilter
  )

  const [activeTab, setActiveTab] = useState(0)

  return (
    <View gap="16px">
      <Flex style={{ alignItems: 'center' }}>
        <TabBar
          titles={[
            <TabTitle
              key="active"
              loadingAmount={loadingPairs || loading}
              itemsAmount={singleSidedCampaings.active.length}
              badgeTheme="orange"
            >
              Campaigns
            </TabTitle>,
            <TabTitle
              key="active"
              loadingAmount={loadingPairs || loading}
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
          handleToggle={() =>
            setDataFiler(dataFilter === PairsFilterType.MY ? PairsFilterType.ALL : PairsFilterType.MY)
          }
        />
      </Flex>

      {!loadingPairs && !loading ? (
        <>
          {activeTab === 0 && <List loading={loadingPairs || loading} items={singleSidedCampaings.active} />}
          {activeTab === 1 && <List loading={loadingPairs || loading} items={singleSidedCampaings.expired} />}
        </>
      ) : (
        <List loading />
      )}
    </View>
  )
}
