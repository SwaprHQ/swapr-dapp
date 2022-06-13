import { Currency, currencyEquals, TokenAmount } from '@swapr/sdk'

import React, { useCallback, useMemo, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { Actions, ActionType, CampaignType, RewardsObject } from '../../../../../pages/LiquidityMining/Create'
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
  rewardsObject: RewardsObject[]
  setRewardsObject: React.Dispatch<Actions>
}

export default function RewardsSelection({ rewardsObject, setRewardsObject }: RewardAmountProps) {
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
    const filteredRewardsArray = rewardsObject
      .map(reward => reward.reward?.currency)
      .filter(currency => currency && currency !== undefined) as Currency[]

    if (filteredRewardsArray.length !== 0) return filteredRewardsArray
    else return undefined
  }, [rewardsObject])

  const handlePairSelection = useCallback(
    selectedPair => {
      const checkIfSelectedPairExists = disabledRewardsArray?.some(currency => currencyEquals(currency, selectedPair))
      if (currentReward !== undefined && !checkIfSelectedPairExists) {
        console.log('hereagain', currentReward)

        setRewardsObject({
          type: ActionType.REWARDS_CHANGE,
          payload: {
            index: currentReward,
            reward: new TokenAmount(selectedPair, '0'),
          },
        })
        if (rewardsObject.length < 4)
          setRewardsObject({
            type: ActionType.ADD_REWARD,
            payload: {
              index: currentReward,
            },
          })
      }
    },
    [rewardsObject, currentReward, setRewardsObject, disabledRewardsArray]
  )

  const handleCurrencyReset = useCallback(
    index => {
      setRewardsObject({ type: ActionType.REMOVE_REWARD, payload: { index: index } })
    },
    [setRewardsObject]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      console.log('rawBValue', rawValue)
      const newParsedAmount = tryParseAmount(rawValue, rewardsObject[index]?.reward?.currency) as
        | TokenAmount
        | undefined
      const currentCurrency = rewardsObject[index]?.reward?.token

      setRewardsObject({
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
    [setRewardsObject, rewardsObject]
  )

  console.log('rewards )OBJECT', rewardsObject)
  return (
    <>
      <FlexWrapper marginTop="32px" flexWrap="wrap">
        {[...Array(rewardsObject.length)].map((item, index) => (
          <AssetSelector
            key={index}
            currency0={rewardsObject[index]?.reward?.token}
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
            amount={rewardsObject[index].reward}
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            isReward={true}
            setRewardsObject={setRewardsObject}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={rewardsObject[index].rawAmount}
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
