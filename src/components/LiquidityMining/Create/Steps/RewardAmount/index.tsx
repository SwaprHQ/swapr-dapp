import { Currency, currencyEquals, TokenAmount } from '@swapr/sdk'

import React, { useCallback, useMemo, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { Actions, ActionType, CampaignType, RewardsArray } from '../../../../../pages/LiquidityMining/Create'
import { tryParseAmount } from '../../../../../state/swap/hooks'
import { CurrencySearchModal } from '../../../../SearchModal/CurrencySearchModal'
import AssetSelector from '../PairAndReward/AssetSelector'

const FlexWrapper = styled(Flex)`
  gap: 28px;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap:40px;
  `}
`
interface RewardAmountProps {
  rewardsArray: RewardsArray[]
  setRewardsArray: React.Dispatch<Actions>
}

export default function RewardsSelection({ rewardsArray, setRewardsArray }: RewardAmountProps) {
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)

  const [currentReward, setCurrentReward] = useState<number | undefined>(undefined)

  const handleDismissCurrencySearch = useCallback(() => {
    setCurrencySearchOpen(false)
  }, [])

  const handleOpenPairOrTokenSearch = useCallback(value => {
    setCurrentReward(value)
    setCurrencySearchOpen(true)
  }, [])

  const disabledRewardsArray = useMemo(() => {
    const filteredRewardsArray = rewardsArray
      .map(({ reward }) => reward?.currency)
      .filter(currency => currency && currency !== undefined) as Currency[]

    if (filteredRewardsArray.length !== 0) return filteredRewardsArray
    else return undefined
  }, [rewardsArray])

  const handlePairSelection = useCallback(
    selectedPair => {
      const checkIfSelectedPairExists = disabledRewardsArray?.some(currency => currencyEquals(currency, selectedPair))
      if (currentReward !== undefined && !checkIfSelectedPairExists) {
        setRewardsArray({
          type: ActionType.REWARDS_CHANGE,
          payload: {
            index: currentReward,
            reward: new TokenAmount(selectedPair, '0'),
          },
        })
        if (rewardsArray.length < 4)
          setRewardsArray({
            type: ActionType.ADD_REWARD,
            payload: {
              index: currentReward,
            },
          })
      }
    },
    [rewardsArray, currentReward, setRewardsArray, disabledRewardsArray]
  )

  const handleCurrencyReset = useCallback(
    index => {
      setRewardsArray({ type: ActionType.REMOVE_REWARD, payload: { index: index } })
    },
    [setRewardsArray]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      const newParsedAmount = tryParseAmount(rawValue, rewardsArray[index]?.reward?.currency) as TokenAmount | undefined
      const currentCurrency = rewardsArray[index]?.reward?.token

      setRewardsArray({
        type: ActionType.REWARDS_CHANGE,
        payload: {
          index: index,
          rawAmount: rawValue,
          reward: newParsedAmount
            ? newParsedAmount
            : currentCurrency
            ? new TokenAmount(currentCurrency, '0')
            : undefined,
        },
      })
    },
    [setRewardsArray, rewardsArray]
  )

  return (
    <>
      <FlexWrapper marginTop="32px" flexWrap="wrap">
        {[...Array(rewardsArray.length)].map((item, index) => (
          <AssetSelector
            key={index}
            currency0={rewardsArray[index]?.reward?.token}
            campaingType={CampaignType.TOKEN}
            onClick={() => handleOpenPairOrTokenSearch(index)}
            customAssetTitle={
              index === 0 ? (
                <div>ADD REWARD</div>
              ) : (
                <div>
                  ADDITIONAL<br></br> REWARDS
                </div>
              )
            }
            amount={rewardsArray[index].reward}
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            isReward={true}
            setRewardsObject={setRewardsArray}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={rewardsArray[index].rawAmount}
          />
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
