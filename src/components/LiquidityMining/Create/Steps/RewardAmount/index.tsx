import { TokenAmount } from '@swapr/sdk'
import React, { useCallback, useState } from 'react'
import { Flex } from 'rebass'

import { tryParseAmount } from '../../../../../state/swap/hooks'

import AssetSelector from '../PairAndReward/AssetSelector'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import styled from 'styled-components'

const FlexWrapper = styled(Flex)``
interface RewardAmountProps {
  rewardsObject: (TokenAmount | undefined)[]
  onRewardsObjectChange: (rewardsObject: (TokenAmount | undefined)[]) => void
}

export default function RewardAmount({ rewardsObject, onRewardsObjectChange }: RewardAmountProps) {
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
        onRewardsObjectChange(
          [...rewardsObject].map((item, i) => (i === currentReward ? new TokenAmount(selectedPair, '0') : item))
        )
      }
    },
    [currentReward, rewardsObject, onRewardsObjectChange]
  )

  const handleCurrencyReset = useCallback(
    index => {
      onRewardsObjectChange([...rewardsObject].map((item, i) => (i === index ? undefined : item)))
    },
    [rewardsObject, onRewardsObjectChange]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      const newParsedAmount = tryParseAmount(
        rawValue,
        rewardsObject[index]?.token ? rewardsObject[index]?.token : undefined
      ) as TokenAmount | undefined

      onRewardsObjectChange(
        [...rewardsObject].map((item, i) =>
          i === index && item ? (newParsedAmount ? newParsedAmount : new TokenAmount(item.token, '0')) : item
        )
      )
    },
    [onRewardsObjectChange, rewardsObject]
  )

  return (
    <>
      <FlexWrapper>
        {[...rewardsObject].map((item, index) => (
          <AssetSelector
            key={index}
            currency0={rewardsObject[index] !== undefined ? rewardsObject[index]?.token : undefined}
            campaingType={CampaignType.TOKEN}
            onClick={() => handelOpenPairOrTokenSearch(index)}
            customAssetTitle={index === 0 ? 'ADD REWARD' : 'ADDITIONAL REWARDS'}
            amount={
              rewardsObject[index] !== undefined && rewardsObject[index] !== undefined
                ? rewardsObject[index]?.toExact()
                : ''
            }
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            onResetCurrency={() => handleCurrencyReset(index)}
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
