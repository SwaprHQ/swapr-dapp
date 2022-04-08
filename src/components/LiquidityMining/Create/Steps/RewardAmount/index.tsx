import { TokenAmount } from '@swapr/sdk'
import React, { useCallback, useState } from 'react'
import { Flex } from 'rebass'

import { tryParseAmount } from '../../../../../state/swap/hooks'

import AssetSelector from '../PairAndReward/AssetSelector'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import styled from 'styled-components'

const FlexWrapper = styled(Flex)`
  gap: 16px;
  margin-top: 32px !important;
  width: fit-content;
`
interface RewardAmountProps {
  newRewardsObject: any
  setRewardsObject: any
}

export default function RewardAmount({ newRewardsObject, setRewardsObject }: RewardAmountProps) {
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
        setRewardsObject({ type: 'REWARDS_CHANGE', index: currentReward, reward: new TokenAmount(selectedPair, '0') })
      }
    },
    [currentReward, setRewardsObject]
  )

  const handleCurrencyReset = useCallback(
    index => {
      setRewardsObject({ type: 'RAW_AMOUNTS', rawAmount: undefined, index: index })
      setRewardsObject({ type: 'REWARDS_CHANGE', index: index, reward: undefined })
    },
    [setRewardsObject]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      setRewardsObject({ type: 'RAW_AMOUNTS', rawAmount: rawValue, index: index })

      const newParsedAmount = tryParseAmount(rawValue, newRewardsObject.rewards[index]?.token) as
        | TokenAmount
        | undefined

      setRewardsObject({
        type: 'REWARDS_CHANGE',
        index: index,
        reward: newParsedAmount ? newParsedAmount : new TokenAmount(newRewardsObject.rewards[index].token, '0')
      })
    },
    [setRewardsObject, newRewardsObject]
  )

  return (
    <>
      <FlexWrapper>
        {[...newRewardsObject.rewards].map((item, index) => (
          <AssetSelector
            key={index}
            currency0={newRewardsObject.rewards[index]?.token}
            campaingType={CampaignType.TOKEN}
            onClick={() => handelOpenPairOrTokenSearch(index)}
            customAssetTitle={index === 0 ? 'ADD REWARD' : 'ADDITIONAL REWARDS'}
            amount={newRewardsObject.rewards[index]}
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            dispatch={setRewardsObject}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={newRewardsObject.rawAmounts[index]}
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
