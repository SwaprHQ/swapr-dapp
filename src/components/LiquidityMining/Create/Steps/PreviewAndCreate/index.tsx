import React, { useCallback, useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import {
  LiquidityMiningCampaign,
  Pair,
  Percent,
  SingleSidedLiquidityMiningCampaign,
  Token,
  TokenAmount
} from '@swapr/sdk'
import PoolSummary from './PoolSummary'
import RewardSummary from './RewardSummary'
import { Card, Divider, SmoothGradientCard } from '../../../styleds'
import { ButtonPrimary } from '../../../../Button'

import styled from 'styled-components'
import { useActiveWeb3React } from '../../../../../hooks'
import { CampaignCard } from '../../../../Pool/PairsList/CampaignCard'
import { getStakedAmountUSD } from '../../../../../utils/liquidityMining'
import { useNativeCurrencyUSDPrice } from '../../../../../hooks/useNativeCurrencyUSDPrice'
import { TYPE } from '../../../../../theme'
import { Repeat } from 'react-feather'
import Slider from '../../../../Slider'
import useDebouncedChangeHandler from '../../../../../utils/useDebouncedChangeHandler'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`

const ResponsiveContainer = styled(Box)<{ flex1?: boolean }>`
  flex: ${props => (props.flex1 ? 1 : 'auto')};
  ${props => props.theme.mediaWidth.upToExtraSmall`
    margin-top: 16px !important;
  `}
`
const StyledCampaignCard = styled(CampaignCard)`
  width: 50%;
`
const CampaignDetailWrapper = styled(Flex)`
  gap: 32px;
`
const SimulatedValue = styled.div`
  font-family: 'Fira Mono';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  /* identical to box height */

  text-align: right;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: ${props => props.theme.text2};
`
const StyledSwitch = styled(Repeat)`
  width: 12px;
  height: 12px;
  stroke: ${props => props.theme.text5};
  margin-left: 4px;
`
const SwitchContainer = styled.div`
  font-size: 10px;
  display: flex;
  font-weight: 600;
  color: ${props => props.theme.text5};
  line-height: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
`

interface PreviewProps {
  campaign: SingleSidedLiquidityMiningCampaign | LiquidityMiningCampaign | null
  liquidityPair: Pair | Token | null
  apy: Percent
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  stakingCap: TokenAmount | null
  approvals: boolean
  reward: TokenAmount[]
  onCreate: () => void
}

export default function PreviewAndCreate({
  liquidityPair,
  startTime,
  endTime,
  timelocked,
  stakingCap,
  reward,
  apy,
  approvals,
  onCreate,
  campaign
}: PreviewProps) {
  const { account } = useActiveWeb3React()
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const { loading: loadingNativeCurrencyUsdPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()
  const [showUSDValue, setShowUSDValue] = useState(false)
  const [simulatedValue, setSimulatedValue] = useState(0)
  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      console.log(value)
      setSimulatedValue(value)
    },
    [setSimulatedValue]
  )
  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    simulatedValue,
    liquidityPercentChangeCallback
  )
  useEffect(() => {
    setAreButtonsDisabled(!!(!account || !reward || !liquidityPair || !startTime || !endTime || approvals))
  }, [account, reward, liquidityPair, startTime, endTime, approvals])
  const getConfirmButtonMessage = () => {
    if (!account) {
      return 'Connect your wallet'
    }

    return 'Deposit & create'
  }
  const isSingleSided = campaign instanceof SingleSidedLiquidityMiningCampaign
  const handleUSDValueClick = useCallback(() => {
    setShowUSDValue(!showUSDValue)
  }, [showUSDValue])
  return (
    <Flex flexDirection="column" style={{ zIndex: -1 }}>
      {campaign !== null && !loadingNativeCurrencyUsdPrice && (
        <CampaignDetailWrapper flexDirection={'row'} mb="32px">
          <StyledCampaignCard
            token0={
              campaign instanceof SingleSidedLiquidityMiningCampaign
                ? campaign.stakeToken
                : campaign.targetedPair.token0
            }
            usdLiquidity={getStakedAmountUSD(campaign.staked.nativeCurrencyAmount, nativeCurrencyUSDPrice)}
            token1={campaign instanceof LiquidityMiningCampaign && campaign.targetedPair.token1}
            // containsKpiToken={campaign instanceof LiquidityMiningCampaign ? campaign.containsKpiToken : false}
            isSingleSidedStakingCampaign={isSingleSided}
            apy={apy}
            usdLiquidityText={campaign.locked ? 'LOCKED' : 'STAKED'}
            staked={true}
            campaign={campaign}
          />
          <SmoothGradientCard
            justifyContent={'space-between !important'}
            flexDirection={'column'}
            alignItems={'center'}
            padding={'24px 28px'}
            width={'50%'}
          >
            <TYPE.largeHeader fontSize={'11px'} letterSpacing="0.08em" color="text3">
              SIMULATED STAKED AMOUNT
            </TYPE.largeHeader>
            <SwitchContainer onClick={handleUSDValueClick}>
              Value in {showUSDValue ? 'crypto' : 'USD'}
              <StyledSwitch />
            </SwitchContainer>
            <SimulatedValue>5.300.00 {showUSDValue ? 'crypto' : 'USD'}</SimulatedValue>
            <Slider value={innerLiquidityPercentage} size={16} onChange={setInnerLiquidityPercentage} />
          </SmoothGradientCard>
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
              <RewardSummary stakingCap={stakingCap} reward={reward} apy={apy} />
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
      <Box>
        <Card>
          <FlexContainer justifyContent="stretch" width="100%">
            <ResponsiveContainer width="100%">
              <ButtonPrimary disabled={areButtonsDisabled} onClick={onCreate}>
                {getConfirmButtonMessage()}
              </ButtonPrimary>
            </ResponsiveContainer>
          </FlexContainer>
        </Card>
      </Box>
    </Flex>
  )
}
