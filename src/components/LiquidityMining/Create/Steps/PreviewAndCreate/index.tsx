import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import {
  LiquidityMiningCampaign,
  Pair,
  Percent,
  SingleSidedLiquidityMiningCampaign,
  Token,
  TokenAmount,
} from '@swapr/sdk'
import PoolSummary from './PoolSummary'
import RewardSummary from './RewardSummary'
import { Card, Divider } from '../../../styleds'
import { ButtonPrimary } from '../../../../Button'

import styled from 'styled-components'
import { useActiveWeb3React } from '../../../../../hooks'
import { CampaignCard } from '../../../../Pool/PairsList/CampaignCard'
import { getStakedAmountUSD } from '../../../../../utils/liquidityMining'
import { useNativeCurrencyUSDPrice } from '../../../../../hooks/useNativeCurrencyUSDPrice'

import SimulateStaking from './SimulateStaking'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`

const ResponsiveContainer = styled(Box)<{ flex1?: boolean }>`
  flex: ${({ flex1 }) => (flex1 ? 1 : 'auto')};
`
const StyledCampaignCard = styled(CampaignCard)`
  width: 354px;
  height: 162px;
`
const CampaignDetailWrapper = styled(Flex)`
  gap: 32px;
`

interface PreviewProps {
  campaign: SingleSidedLiquidityMiningCampaign | LiquidityMiningCampaign | null
  liquidityPair: Pair | Token | null
  simulatedPrice: string
  setSimulatedPrice: (price: string) => void
  apr: Percent
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  stakingCap: TokenAmount | null
  approvals: boolean
  rewards: TokenAmount[]
  onCreate: () => void
  setSimulatedStakedAmount: (value: string) => void
}

export default function PreviewAndCreate({
  liquidityPair,
  startTime,
  endTime,
  timelocked,
  stakingCap,
  rewards,
  apr,
  approvals,
  onCreate,
  campaign,
  setSimulatedStakedAmount,
  setSimulatedPrice,
  simulatedPrice,
}: PreviewProps) {
  const { account } = useActiveWeb3React()
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()

  useEffect(() => {
    setAreButtonsDisabled(
      !!(!account || !rewards || !liquidityPair || !startTime || !endTime || approvals || campaign === null)
    )
  }, [account, rewards, liquidityPair, startTime, endTime, approvals, campaign])

  const getConfirmButtonMessage = () => {
    if (!account) return 'Connect your wallet'
    else if (approvals) return 'Rewards not approved/Insufficient balance'
    else if (campaign === null) return 'One of tokens not priced'

    return 'Deposit & create'
  }
  const isSingleSided = campaign instanceof SingleSidedLiquidityMiningCampaign

  return (
    <Flex flexDirection="column" style={{ zIndex: -1 }}>
      {campaign !== null && !loadingNativeCurrencyUsdPrice && (
        <CampaignDetailWrapper flexWrap="wrap" flexDirection={'row'} mb="32px">
          <StyledCampaignCard
            token0={
              campaign instanceof SingleSidedLiquidityMiningCampaign
                ? campaign.stakeToken
                : campaign.targetedPair.token0
            }
            usdLiquidity={getStakedAmountUSD(campaign.staked.nativeCurrencyAmount, nativeCurrencyUSDPrice)}
            token1={campaign instanceof LiquidityMiningCampaign ? campaign.targetedPair.token1 : undefined}
            //TODO: add check for kpi token indicator containsKpiToken={campaign instanceof LiquidityMiningCampaign ? campaign.containsKpiToken : false}
            isSingleSidedStakingCampaign={isSingleSided}
            apy={apr}
            usdLiquidityText={campaign.locked ? 'LOCKED' : 'STAKED'}
            staked={true}
            campaign={campaign}
          />
          <SimulateStaking
            setSimulatedPrice={setSimulatedPrice}
            simulatedPrice={simulatedPrice}
            nativeCurrencyUSDPrice={nativeCurrencyUSDPrice}
            loading={loadingNativeCurrencyUsdPrice}
            setSimulatedStakedAmount={setSimulatedStakedAmount}
            tokenOrPair={liquidityPair}
            stakingCap={stakingCap}
          />
        </CampaignDetailWrapper>
      )}

      <Box mb="40px">
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <PoolSummary
              liquidityPair={liquidityPair}
              startTime={startTime}
              endTime={endTime}
              timelocked={timelocked}
            />
            <Box mx="18px">
              <Divider />
            </Box>
            <ResponsiveContainer flex1>
              <RewardSummary stakingCap={stakingCap} rewards={rewards} apr={apr} />
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
      <Box>
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <ResponsiveContainer width="100%">
              <ButtonPrimary data-testid="confirm-button" disabled={areButtonsDisabled} onClick={onCreate}>
                {getConfirmButtonMessage()}
              </ButtonPrimary>
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
    </Flex>
  )
}
