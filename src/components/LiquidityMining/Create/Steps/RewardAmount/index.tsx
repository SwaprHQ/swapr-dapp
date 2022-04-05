import { TokenAmount } from '@swapr/sdk'
import React, { useCallback, useState } from 'react'
import { Flex } from 'rebass'

import { tryParseAmount } from '../../../../../state/swap/hooks'

import AssetSelector from '../PairAndReward/AssetSelector'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import styled from 'styled-components'
import { ApprovalState } from '../../../../../hooks/useApproveCallback'

const FlexWrapper = styled(Flex)`
  gap: 16px;
  margin-top: 32px !important;
  width: fit-content;
`
interface RewardAmountProps {
  rewardsObject: (TokenAmount | undefined)[]
  onRewardsObjectChange: (rewardsObject: (TokenAmount | undefined)[]) => void
  setApprovals: (approvals: ApprovalState[]) => void
  approvals: ApprovalState[]
}

export default function RewardAmount({
  approvals,
  rewardsObject,
  onRewardsObjectChange,
  setApprovals
}: RewardAmountProps) {
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)

  const [currentReward, setCurrentReward] = useState<number | undefined>(undefined)

  const [rawAmounts, setRawAmounts] = useState<(string | undefined)[]>(new Array(4).fill(undefined))

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
      setRawAmounts([...rawAmounts].map((item, i) => (i === index ? undefined : item)))
      onRewardsObjectChange([...rewardsObject].map((item, i) => (i === index ? undefined : item)))
    },
    [rewardsObject, onRewardsObjectChange, rawAmounts]
  )

  const handleLocalUserInput = useCallback(
    (rawValue, index) => {
      setRawAmounts([...rawAmounts].map((item, i) => (i === index ? rawValue : item)))
      console.log(rawValue)
      const newParsedAmount = tryParseAmount(rawValue, rewardsObject[index]?.token) as TokenAmount | undefined
      console.log(newParsedAmount?.toExact())

      onRewardsObjectChange(
        [...rewardsObject].map((item, i) =>
          i === index && item ? (newParsedAmount ? newParsedAmount : new TokenAmount(item.token, '0')) : item
        )
      )
    },
    [onRewardsObjectChange, rewardsObject, rawAmounts]
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
            amount={rewardsObject[index]}
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            setApprovals={setApprovals}
            approvals={approvals}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={rawAmounts[index]}
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
