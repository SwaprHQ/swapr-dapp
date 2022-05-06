import { Currency, currencyEquals, TokenAmount } from '@swapr/sdk'
import React, { useCallback, useMemo, useState } from 'react'
import { Flex } from 'rebass'

import { tryParseAmount } from '../../../../../state/swap/hooks'

import AssetSelector from '../PairAndReward/AssetSelector'
import {
  Actions,
  ActionType,
  CampaignType,
  numberOfRewards,
  RewardsObject,
} from '../../../../../pages/LiquidityMining/Create'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import styled from 'styled-components'
import { ApprovalState } from '../../../../../hooks/useApproveCallback'

const FlexWrapper = styled(Flex)`
  gap: 28px;
  margin-top: 32px !important;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap:40px;
  `}
`
interface RewardAmountProps {
  rewardsObject: RewardsObject
  setRewardsObject: React.Dispatch<Actions>
}

export default function RewardsSelection({ rewardsObject, setRewardsObject }: RewardAmountProps) {
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)

  const [currentReward, setCurrentReward] = useState<number | undefined>(undefined)

  const handleDismissCurrencySearch = useCallback(() => {
    setCurrencySearchOpen(false)
  }, [])
  const handelOpenPairOrTokenSearch = useCallback(value => {
    setCurrentReward(value)
    setCurrencySearchOpen(true)
  }, [])
  const disabledRewardsArray = useMemo(() => {
    const mappedArray = rewardsObject.rewards.map(reward => reward?.currency)
    const filteredArray = mappedArray.filter(currency => currency && currency !== undefined) as Currency[]

    if (filteredArray.length !== 0) return filteredArray
    else return undefined
  }, [rewardsObject])

  const handlePairSelection = useCallback(
    selectedPair => {
      const checkIfSelectedPairExists = disabledRewardsArray?.some(currency => currencyEquals(currency, selectedPair))
      if (currentReward !== undefined && !checkIfSelectedPairExists) {
        setRewardsObject({
          type: ActionType.REWARDS_CHANGE,
          payload: {
            index: currentReward,
            reward: new TokenAmount(selectedPair, '0'),
          },
        })
      }
    },
    [currentReward, setRewardsObject, disabledRewardsArray]
  )

  const handleCurrencyReset = useCallback(
    index => {
      setRewardsObject({ type: ActionType.RAW_AMOUNTS, payload: { index: index, rawAmount: undefined } })
      setRewardsObject({
        type: ActionType.REWARDS_CHANGE,
        payload: { index: index, reward: undefined },
      })
      setRewardsObject({
        type: ActionType.APPROVALS_CHANGE,
        payload: { index: index, approval: ApprovalState.UNKNOWN },
      })
    },
    [setRewardsObject]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      setRewardsObject({ type: ActionType.RAW_AMOUNTS, payload: { rawAmount: rawValue, index: index } })

      const newParsedAmount = tryParseAmount(rawValue, rewardsObject.rewards[index]?.currency) as
        | TokenAmount
        | undefined
      const currentCurrency = rewardsObject.rewards[index]?.token
      console.log(currentCurrency)
      console.log(rewardsObject.rewards[index])
      setRewardsObject({
        type: ActionType.REWARDS_CHANGE,
        payload: {
          index: index,
          reward: newParsedAmount
            ? newParsedAmount
            : currentCurrency
            ? new TokenAmount(currentCurrency, '0')
            : undefined,
        },
      })
    },
    [setRewardsObject, rewardsObject]
  )

  return (
    <>
      <FlexWrapper flexWrap="wrap">
        {[...Array(numberOfRewards)].map((item, index) => (
          <>
            <AssetSelector
              key={index}
              currency0={rewardsObject.rewards[index]?.token}
              campaingType={CampaignType.TOKEN}
              onClick={() => handelOpenPairOrTokenSearch(index)}
              customAssetTitle={index === 0 ? 'ADD REWARD' : 'ADDITIONAL REWARDS'}
              amount={rewardsObject.rewards[index]}
              handleUserInput={event => {
                handleLocalUserInput(event, index)
              }}
              isReward={true}
              setRewardsObject={setRewardsObject}
              onResetCurrency={() => handleCurrencyReset(index)}
              index={index}
              rawAmount={rewardsObject.rawAmounts[index]}
            />
          </>
        ))}
      </FlexWrapper>

      <CurrencySearchModal
        isOpen={currencySearchOpen}
        otherSelectedCurrency={disabledRewardsArray}
        onDismiss={handleDismissCurrencySearch}
        onCurrencySelect={handlePairSelection}
        showNativeCurrency={false}
      />
    </>
  )
}
