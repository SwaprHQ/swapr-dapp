import { Pair, Percent, Token, TokenAmount } from '@swapr/sdk'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AutoColumn } from '../../../components/Column'
import ConfirmStakingRewardsDistributionCreation from '../../../components/LiquidityMining/ConfirmStakingRewardsDistributionCreation'
import Step from '../../../components/LiquidityMining/Create/Steps'
import StakeTokenAndLimit from '../../../components/LiquidityMining/Create/Steps/PairAndReward'
import PreviewAndCreate from '../../../components/LiquidityMining/Create/Steps/PreviewAndCreate'
import RewardsSelection from '../../../components/LiquidityMining/Create/Steps/RewardAmount'
import SingleOrPairCampaign from '../../../components/LiquidityMining/Create/Steps/SingleOrPairCampaign'
import DurationAndLocking from '../../../components/LiquidityMining/Create/Steps/Time'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { useCreateLiquidityMiningCallback } from '../../../hooks/useCreateLiquidityMiningCallback'
import { useNewLiquidityMiningCampaign } from '../../../hooks/useNewLiquidityMiningCampaign'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../../../ui/PageWrapper'

const LastStep = styled(Step)`
  z-index: 0;
`
export enum CampaignType {
  TOKEN,
  PAIR,
}

export interface Reward {
  approvalState: ApprovalState
  rewardTokenAmount: TokenAmount | undefined
  rewardRawAmount: string | undefined
}

export enum ActionType {
  APPROVAL_CHANGE,
  REWARD_CHANGE,
  REMOVE_REWARD,
  RESET,
}
export interface Actions {
  type: ActionType
  payload: {
    index: number
    reward?: TokenAmount | undefined
    rawAmount?: string
    approval?: ApprovalState
  }
}
const initialState: Reward = {
  approvalState: ApprovalState.UNKNOWN,
  rewardTokenAmount: undefined,
  rewardRawAmount: undefined,
}

const reducer = (state: Reward[], action: Actions): Reward[] => {
  const { type, payload } = action

  const mutableState = [...state]
  switch (type) {
    case ActionType.APPROVAL_CHANGE:
      const approvalObject: Reward = {
        approvalState: payload.approval !== undefined ? payload.approval : state[payload.index].approvalState,
        rewardTokenAmount: state[payload.index].rewardTokenAmount,
        rewardRawAmount: state[payload.index].rewardRawAmount,
      }

      mutableState.splice(payload.index, 1, approvalObject)

      return mutableState

    case ActionType.REWARD_CHANGE:
      const newRewardObject: Reward = {
        approvalState: state[payload.index].approvalState ? state[payload.index].approvalState : ApprovalState.UNKNOWN,
        rewardTokenAmount: payload.reward,
        rewardRawAmount: payload.rawAmount,
      }

      mutableState.splice(payload.index, 1, newRewardObject)

      const hasAdditionalReward = mutableState.some(({ rewardTokenAmount: reward }) => reward?.currency === undefined)
      if (!hasAdditionalReward && mutableState.length < 4) mutableState.push(initialState)

      return mutableState

    case ActionType.REMOVE_REWARD:
      const hasMaxNumberOfReward = state.every(reward => reward.rewardTokenAmount !== undefined)

      if (payload.index === 0 && state.length === 1) return [initialState]

      mutableState.splice(payload.index, 1)

      if (hasMaxNumberOfReward) mutableState.push(initialState)

      return mutableState
    case ActionType.RESET:
      return [initialState]
    default:
      return state
  }
}

export default function CreateLiquidityMining() {
  const { t } = useTranslation('liquidity')

  const { chainId } = useActiveWeb3React()
  const [attemptingTransaction, setAttemptingTransaction] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [campaingType, setCampaignType] = useState<CampaignType>(CampaignType.TOKEN)

  const [stakeToken, setStakeToken] = useState<Token | undefined>(undefined)
  const [stakePair, setStakePair] = useState<Pair | undefined>(undefined)

  const [unlimitedPool, setUnlimitedPool] = useState(true)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timelocked, setTimelocked] = useState(false)
  const [stakingCap, setStakingCap] = useState<TokenAmount | null>(null)
  const [rewardsArray, dispatch] = useReducer(reducer, [initialState])
  const [simulatedStakedAmount, setSimulatedStakedAmount] = useState<string>('0')
  const [simulatedPrice, setSimulatedPrice] = useState('0')

  const memoizedRewardsArray = useMemo(
    () =>
      rewardsArray.length
        ? rewardsArray.map(({ rewardTokenAmount: reward }: Reward) => reward).filter(reward => reward?.greaterThan('0'))
        : new Array(rewardsArray.length).fill(undefined),
    [rewardsArray]
  )
  const memoizedApprovalsArray = useMemo(
    () =>
      rewardsArray.some(({ approvalState: approval }: Reward) =>
        approval === ApprovalState.APPROVED || approval === ApprovalState.UNKNOWN ? false : true
      ),
    [rewardsArray]
  )

  const campaign = useNewLiquidityMiningCampaign(
    memoizedRewardsArray,
    startTime,
    endTime,
    timelocked,
    stakingCap,
    simulatedStakedAmount,
    simulatedPrice,
    stakeToken,
    stakePair
  )

  const addTransaction = useTransactionAdder()
  const createLiquidityMiningCallback = useCreateLiquidityMiningCallback(campaign)

  const handleTimelockedChange = useCallback(
    (value?: boolean) => {
      setTimelocked(value !== undefined ? value : !timelocked)
    },
    [timelocked]
  )

  const handleCreateRequest = useCallback(() => {
    if (!createLiquidityMiningCallback) return
    setShowConfirmationModal(true)
  }, [createLiquidityMiningCallback])

  const handleCreateConfirmation = useCallback(() => {
    if (!createLiquidityMiningCallback) return
    setAttemptingTransaction(true)
    createLiquidityMiningCallback()
      .then(transaction => {
        setErrorMessage('')
        setTransactionHash(transaction.hash || null)
        addTransaction(transaction, {
          summary: `Create liquidity mining campaign on ${
            stakePair ? `${stakePair.token0.symbol}/${stakePair.token1.symbol}` : stakeToken ? stakeToken.symbol : ''
          }`,
        })
      })
      .catch(error => {
        console.error(error)
        setErrorMessage('Error broadcasting transaction')
      })
      .finally(() => {
        setAttemptingTransaction(false)
      })
  }, [addTransaction, createLiquidityMiningCallback, stakeToken, stakePair])

  const resetAllFileds = () => {
    dispatch({ type: ActionType.RESET, payload: { index: 0 } })
    setStakePair(undefined)
    setStakeToken(undefined)
    setUnlimitedPool(true)
    setStartTime(null)
    setEndTime(null)
    setTimelocked(false)
  }
  const handleCreateDismiss = useCallback(() => {
    if (transactionHash) {
      // the creation tx has been submitted, let's empty the creation form
      setCampaignType(CampaignType.TOKEN)
      resetAllFileds()
    }
    setErrorMessage('')
    setTransactionHash(null)
    setShowConfirmationModal(false)
  }, [transactionHash])

  useEffect(() => {
    resetAllFileds()
  }, [chainId, handleCreateDismiss, campaingType])

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="40px">
          <AutoColumn gap="8px">
            <TYPE.MediumHeader lineHeight="24px">{t('liquidityMining.create.title')}</TYPE.MediumHeader>
          </AutoColumn>
          <Step title={t('liquidityMining.create.chooseCampaign')} index={0} disabled={false}>
            <SingleOrPairCampaign singleReward={campaingType} onChange={setCampaignType} />
          </Step>
          <Step
            title={
              campaingType === CampaignType.TOKEN
                ? t('liquidityMining.create.selectToken')
                : t('liquidityMining.create.selectPair')
            }
            index={1}
            disabled={false}
          >
            <StakeTokenAndLimit
              unlimitedPool={unlimitedPool}
              onUnlimitedPoolChange={setUnlimitedPool}
              campaingType={campaingType}
              stakeToken={stakeToken}
              stakePair={stakePair}
              setStakeToken={setStakeToken}
              setStakePair={setStakePair}
              onStakingCapChange={setStakingCap}
            />
          </Step>
          <Step title={t('liquidityMining.create.duration')} index={2} disabled={!stakeToken && !stakePair}>
            <DurationAndLocking
              startTime={startTime}
              endTime={endTime}
              timelocked={timelocked}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              onTimelockedChange={handleTimelockedChange}
            />
          </Step>
          <Step
            title={t('liquidityMining.create.reward')}
            index={3}
            key={3}
            disabled={!startTime || !endTime || (!stakeToken && !stakePair)}
          >
            <RewardsSelection rewardsArray={rewardsArray} setRewardsArray={dispatch} />
          </Step>
          <LastStep
            title={t('liquidityMining.create.preview')}
            index={4}
            disabled={(!stakeToken && !stakePair) || !startTime || !endTime || memoizedRewardsArray.length === 0}
          >
            <PreviewAndCreate
              simulatedPrice={simulatedPrice}
              setSimulatedPrice={setSimulatedPrice}
              campaign={campaign}
              approvals={memoizedApprovalsArray}
              stakePair={stakePair}
              stakeToken={stakeToken}
              startTime={startTime}
              endTime={endTime}
              timelocked={timelocked}
              rewards={memoizedRewardsArray}
              stakingCap={stakingCap}
              apr={campaign ? campaign.apy : new Percent('0', '100')}
              onCreate={handleCreateRequest}
              setSimulatedStakedAmount={setSimulatedStakedAmount}
            />
          </LastStep>
        </AutoColumn>
      </PageWrapper>
      <ConfirmStakingRewardsDistributionCreation
        onConfirm={handleCreateConfirmation}
        onDismiss={handleCreateDismiss}
        isOpen={showConfirmationModal}
        attemptingTransaction={attemptingTransaction}
        transactionHash={transactionHash}
        errorMessage={errorMessage}
        stakeToken={stakeToken}
        stakePair={stakePair}
        startTime={startTime}
        endTime={endTime}
        rewards={memoizedRewardsArray}
        timelocked={timelocked}
        stakingCap={stakingCap}
        unlimitedPool={unlimitedPool}
      />
    </>
  )
}
