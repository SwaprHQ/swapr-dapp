import { TokenAmount } from '@swapr/sdk'
import React, { useCallback, useState } from 'react'
import { Flex } from 'rebass'

import { tryParseAmount } from '../../../../../state/swap/hooks'

import AssetSelector from '../PairAndReward/AssetSelector'
import {
  Actions,
  ActionType,
  CampaignType,
  numberOfRewards,
  RewardsObject
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

  const handlePairSelection = useCallback(
    selectedPair => {
      if (currentReward !== undefined) {
        setRewardsObject({
          type: ActionType.REWARDS_CHANGE,
          payload: {
            index: currentReward,
            reward: new TokenAmount(selectedPair, '0')
          }
        })
      }
    },
    [currentReward, setRewardsObject]
  )

  const handleCurrencyReset = useCallback(
    index => {
      setRewardsObject({ type: ActionType.RAW_AMOUNTS, payload: { rawAmount: undefined, index: index } })
      setRewardsObject({ type: ActionType.REWARDS_CHANGE, payload: { index: index, reward: undefined } })
      setRewardsObject({
        type: ActionType.APPROVALS_CHANGE,
        payload: { index: index, approval: ApprovalState.UNKNOWN }
      })
    },
    [setRewardsObject]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      setRewardsObject({ type: ActionType.RAW_AMOUNTS, payload: { rawAmount: rawValue, index: index } })

      const newParsedAmount = tryParseAmount(rawValue, rewardsObject.rewards[index]?.token) as TokenAmount | undefined

      setRewardsObject({
        type: ActionType.REWARDS_CHANGE,
        payload: {
          index: index,
          reward: newParsedAmount
            ? newParsedAmount
            : // : rewardsObject.rewards[index] && rewardsObject.rewards[index]?.token
              // ? new TokenAmount(rewardsObject.rewards[index].token, '0')
              undefined
        }
      })
    },
    [setRewardsObject, rewardsObject]
  )

  return (
    <>
      <FlexWrapper flexWrap="wrap">
        {[...Array(numberOfRewards)].map((item, index) => (
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
            setRewardsObject={setRewardsObject}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={rewardsObject.rawAmounts[index]}
          />
        ))}
      </FlexWrapper>

      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissCurrencySearch}
        onCurrencySelect={handlePairSelection}
        showNativeCurrency={false}
      />
    </>
  )
}
