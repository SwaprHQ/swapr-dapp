import { Pair, Percent, Token, TokenAmount } from '@swapr/sdk'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from '../../../components/Column'
import Step from '../../../components/LiquidityMining/Create/Steps'
import PairAndReward from '../../../components/LiquidityMining/Create/Steps/PairAndReward'
import RewardAmount from '../../../components/LiquidityMining/Create/Steps/RewardAmount'
import SingleOrPairCampaign from '../../../components/LiquidityMining/Create/Steps/SingleOrPairCampaign'
import Time from '../../../components/LiquidityMining/Create/Steps/Time'
import PreviewAndCreate from '../../../components/LiquidityMining/Create/Steps/PreviewAndCreate'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../styleds'
import { useCreateLiquidityMiningCallback } from '../../../hooks/useCreateLiquidityMiningCallback'
import ConfirmStakingRewardsDistributionCreation from '../../../components/LiquidityMining/ConfirmStakingRewardsDistributionCreation'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useNewLiquidityMiningCampaign } from '../../../hooks/useNewLiquidityMiningCampaign'
import styled from 'styled-components'

const LastStep = styled(Step)`
  z-index: 0;
`
export enum CampaignType {
  TOKEN,
  PAIR
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

  const memoizedRewardArray = useMemo(() => (reward ? [reward] : []), [reward])
  const campaign = useNewLiquidityMiningCampaign(
    targetedPairOrToken,
    memoizedRewardArray,
    startTime,
    endTime,
    timelocked,
    stakingCap
  )

  const addTransaction = useTransactionAdder()
  const createLiquidityMiningCallback = useCreateLiquidityMiningCallback(campaign)

  const handleTimelockedChange = useCallback(() => {
    setTimelocked(!timelocked)
  }, [timelocked])

  // const handleRewardTokenChange = useCallback(
  //   (token: Token) => {
  //     setReward(new TokenAmount(token, reward ? reward.raw.toString() : '0'))
  //   },
  //   [reward]
  // )

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
          <PairAndReward
            campaingType={campaingType}
            liquidityPair={targetedPairOrToken}
            onLiquidityPairChange={setTargetedPairOrToken}
          />
        </Step>
        <Step title="Select reward amount" index={2} disabled={!targetedPairOrToken}>
          <RewardAmount
            reward={reward}
            stakablePair={targetedPairOrToken}
            unlimitedPool={unlimitedPool}
            onRewardAmountChange={setReward}
            onUnlimitedPoolChange={setUnlimitedPool}
            onStakingCapChange={setStakingCap}
          />
        </Step>
        <Step title="Duration and start/end time" index={3} disabled={!reward || reward.equalTo('0')}>
          <Time
            startTime={startTime}
            endTime={endTime}
            timelocked={timelocked}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onTimelockedChange={handleTimelockedChange}
          />
        </Step>
        <LastStep
          title="Preview, approve and create mining pool"
          index={4}
          disabled={!targetedPairOrToken || !startTime || !endTime || !reward || !reward.token || reward.equalTo('0')}
        >
          <PreviewAndCreate
            liquidityPair={targetedPairOrToken}
            startTime={startTime}
            endTime={endTime}
            timelocked={timelocked}
            reward={reward}
            stakingCap={stakingCap}
            apy={campaign ? campaign.apy : new Percent('0', '100')}
            onCreate={handleCreateRequest}
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
