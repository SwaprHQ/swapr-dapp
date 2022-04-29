import { Pair, Percent, Token, TokenAmount } from '@swapr/sdk'
import React, { useCallback, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from '../../../components/Column'
import Step from '../../../components/LiquidityMining/Create/Steps'
import StakeTokenAndLimit from '../../../components/LiquidityMining/Create/Steps/PairAndReward'
import RewardsSelection from '../../../components/LiquidityMining/Create/Steps/RewardAmount'
import SingleOrPairCampaign from '../../../components/LiquidityMining/Create/Steps/SingleOrPairCampaign'

import DurationAndLocking from '../../../components/LiquidityMining/Create/Steps/Time'
import PreviewAndCreate from '../../../components/LiquidityMining/Create/Steps/PreviewAndCreate'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../styleds'
import { useCreateLiquidityMiningCallback } from '../../../hooks/useCreateLiquidityMiningCallback'
import ConfirmStakingRewardsDistributionCreation from '../../../components/LiquidityMining/ConfirmStakingRewardsDistributionCreation'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useNewLiquidityMiningCampaign } from '../../../hooks/useNewLiquidityMiningCampaign'
import styled from 'styled-components'
import { ApprovalState } from '../../../hooks/useApproveCallback'

const LastStep = styled(Step)`
  z-index: 0;
`
export enum CampaignType {
  TOKEN,
  PAIR
}
export const numberOfRewards = 4
export interface RewardsObject {
  approvals: ApprovalState[]
  rewards: (TokenAmount | undefined)[]
  rawAmounts: (string | undefined)[]
}

export enum ActionType {
  APPROVALS_CHANGE,
  REWARDS_CHANGE,
  RAW_AMOUNTS,
  RESET
}
export interface Actions {
  type: ActionType
  payload: {
    index?: number
    reward?: TokenAmount
    rawAmount?: string
    approval?: ApprovalState
  }
}
const initialState: RewardsObject = {
  approvals: new Array(numberOfRewards).fill(ApprovalState.UNKNOWN),
  rewards: new Array(numberOfRewards).fill(undefined),
  rawAmounts: new Array(numberOfRewards).fill(undefined)
}

const reducer = (state: RewardsObject, action: Actions): RewardsObject => {
  const { type, payload } = action
  switch (type) {
    case ActionType.APPROVALS_CHANGE:
      return {
        ...state,
        approvals: state.approvals.map((approval: ApprovalState, i: number) =>
          i === payload.index && payload.approval !== undefined ? payload.approval : approval
        )
      }
    case ActionType.REWARDS_CHANGE:
      return {
        ...state,
        rewards: state.rewards.map((reward: TokenAmount | undefined, i: number) =>
          i === payload.index ? payload.reward : reward
        )
      }
    case ActionType.RAW_AMOUNTS:
      return {
        ...state,
        rawAmounts: state.rawAmounts.map((rawAmount: string | undefined, i: number) =>
          i === payload.index ? payload.rawAmount : rawAmount
        )
      }
    case ActionType.RESET:
      return initialState
    default:
      return state
  }
}

export default function CreateLiquidityMining() {
  const { t } = useTranslation()

  const [attemptingTransaction, setAttemptingTransaction] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [campaingType, setCampaignType] = useState<CampaignType>(CampaignType.TOKEN)
  const [targetedPairOrToken, setTargetedPairOrToken] = useState<Pair | Token | null>(null)
  const [reward, setReward] = useState<TokenAmount | null>(null)
  const [unlimitedPool, setUnlimitedPool] = useState(true)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timelocked, setTimelocked] = useState(false)
  const [stakingCap, setStakingCap] = useState<TokenAmount | null>(null)
  const [rewardsObject, dispatch] = useReducer(reducer, initialState)
  const [simulatedStakedAmount, setSimulatedStakedAmount] = useState<string>('0')

  const memoizedRewardArray = useMemo(
    () =>
      rewardsObject.rewards.length
        ? rewardsObject.rewards.filter((item: TokenAmount | undefined) => item?.greaterThan('0'))
        : new Array(4).fill(undefined),
    [rewardsObject]
  )
  const memoizedApprovalsArray = useMemo(
    () =>
      rewardsObject.approvals.some((value: ApprovalState) =>
        value === ApprovalState.APPROVED || value === ApprovalState.UNKNOWN ? false : true
      ),
    [rewardsObject.approvals]
  )

  const campaign = useNewLiquidityMiningCampaign(
    targetedPairOrToken,
    memoizedRewardArray,
    startTime,
    endTime,
    timelocked,
    stakingCap,
    simulatedStakedAmount
  )

  const addTransaction = useTransactionAdder()
  const createLiquidityMiningCallback = useCreateLiquidityMiningCallback(campaign)

  const handleTimelockedChange = useCallback(() => {
    setTimelocked(!timelocked)
  }, [timelocked])

  const handleCreateRequest = useCallback(() => {
    if (!createLiquidityMiningCallback) return
    setShowConfirmationModal(true)
  }, [createLiquidityMiningCallback])

  const handleStartTimeChange = useCallback((newStartTime: Date) => {
    if (Date.now() > newStartTime.getTime()) return // date in the past, invalid
    setStartTime(newStartTime)
  }, [])

  const handleEndTimeChange = useCallback(
    (newEndTime: Date | null) => {
      if (!newEndTime) {
        setEndTime(null)
        return
      }
      if (startTime ? startTime.getTime() >= newEndTime.getTime() : Date.now() > newEndTime.getTime()) return // date in the past, invalid
      setEndTime(newEndTime)
    },
    [startTime]
  )

  const handleCreateConfirmation = useCallback(() => {
    if (!createLiquidityMiningCallback) return
    setAttemptingTransaction(true)
    createLiquidityMiningCallback()
      .then(transaction => {
        setErrorMessage('')
        setTransactionHash(transaction.hash || null)
        addTransaction(transaction, {
          summary: `Create liquidity mining campaign on ${
            targetedPairOrToken instanceof Pair
              ? `${targetedPairOrToken?.token0.symbol}/${targetedPairOrToken?.token1.symbol}`
              : targetedPairOrToken?.symbol
          }`
        })
      })
      .catch(error => {
        console.error(error)
        setErrorMessage('Error broadcasting transaction')
      })
      .finally(() => {
        setAttemptingTransaction(false)
      })
  }, [addTransaction, createLiquidityMiningCallback, targetedPairOrToken])

  const handleCreateDismiss = useCallback(() => {
    if (transactionHash) {
      // the creation tx has been submitted, let's empty the creation form
      setCampaignType(CampaignType.TOKEN)
      dispatch({ type: ActionType.RESET, payload: {} })
      setTargetedPairOrToken(null)
      setReward(null)
      setUnlimitedPool(true)
      setStartTime(null)
      setEndTime(null)
      setTimelocked(false)
    }
    setErrorMessage('')
    setTransactionHash(null)
    setShowConfirmationModal(false)
  }, [transactionHash])

  return (
    <>
      <PageWrapper gap="40px">
        <AutoColumn gap="8px">
          <TYPE.mediumHeader lineHeight="24px">{t('liquidityMining.create.title')}</TYPE.mediumHeader>
        </AutoColumn>
        <Step title="Choose Campaign" index={0} disabled={false}>
          <SingleOrPairCampaign singleReward={campaingType} onChange={setCampaignType} />
        </Step>
        <Step
          title={`Select ${campaingType === CampaignType.TOKEN ? 'Token' : 'Pair'} to Stake`}
          index={1}
          disabled={campaingType === null}
        >
          <StakeTokenAndLimit
            unlimitedPool={unlimitedPool}
            onUnlimitedPoolChange={setUnlimitedPool}
            campaingType={campaingType}
            targetedPairOrToken={targetedPairOrToken}
            onStakingCapChange={setStakingCap}
            onLiquidityPairChange={setTargetedPairOrToken}
          />
        </Step>
        {/* <Step title="Campaign Duration" index={2} disabled={!targetedPairOrToken}> */}
        <Step title="Campaign Duration" index={2} disabled={false}>
          <DurationAndLocking
            startTime={startTime}
            endTime={endTime}
            timelocked={timelocked}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onTimelockedChange={handleTimelockedChange}
          />
        </Step>
        {/* <Step title="Select Reward Amount" index={3} disabled={!startTime || !endTime}> */}
        <Step title="Select Reward Amount" index={3} disabled={false}>
          <RewardsSelection rewardsObject={rewardsObject} setRewardsObject={dispatch} />
        </Step>

        <LastStep
          title="Preview, approve and create mining pool"
          index={4}
          disabled={!targetedPairOrToken || !startTime || !endTime || memoizedRewardArray.length === 0}
        >
          <PreviewAndCreate
            campaign={campaign}
            approvals={memoizedApprovalsArray}
            liquidityPair={targetedPairOrToken}
            startTime={startTime}
            endTime={endTime}
            timelocked={timelocked}
            reward={memoizedRewardArray}
            stakingCap={stakingCap}
            apy={campaign ? campaign.apy : new Percent('0', '100')}
            onCreate={handleCreateRequest}
            setSimulatedStakedAmount={setSimulatedStakedAmount}
          />
        </LastStep>
      </PageWrapper>
      <ConfirmStakingRewardsDistributionCreation
        onConfirm={handleCreateConfirmation}
        onDismiss={handleCreateDismiss}
        isOpen={showConfirmationModal}
        attemptingTransaction={attemptingTransaction}
        transactionHash={transactionHash}
        errorMessage={errorMessage}
        liquidityPair={targetedPairOrToken}
        startTime={startTime}
        endTime={endTime}
        reward={reward}
        timelocked={timelocked}
        stakingCap={stakingCap}
        unlimitedPool={unlimitedPool}
      />
    </>
  )
}
