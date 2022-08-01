import { Currency, currencyEquals, Token, TokenAmount } from '@swapr/sdk'

import { useCallback, useMemo, useState } from 'react'
import { Flex } from 'rebass/styled-components'
import styled from 'styled-components'

import { Actions, ActionType, CampaignType, Reward } from '../../../../../pages/LiquidityMining/Create'
import { tryParseAmount } from '../../../../../state/swap/hooks'
import { CurrencySearchModal } from '../../../../SearchModal/CurrencySearchModal'
import AssetSelector from '../PairAndReward/AssetSelector'

const FlexWrapper = styled(Flex)`
  gap: 28px;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap:40px;
    justify-content: center;
    width:100%;
  `}
`
interface RewardAmountProps {
  rewardsArray: Reward[]
  setRewardsArray: React.Dispatch<Actions>
}

export default function RewardsSelection({ rewardsArray, setRewardsArray }: RewardAmountProps) {
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)

  const [currentReward, setCurrentReward] = useState<number | undefined>(undefined)

  const handleDismissCurrencySearch = useCallback(() => {
    setCurrencySearchOpen(false)
  }, [])

  const handleOpenPairOrTokenSearch = useCallback((value?: number) => {
    setCurrentReward(value)
    setCurrencySearchOpen(true)
  }, [])

  const disabledRewardsArray = useMemo(() => {
    const filteredRewardsArray = rewardsArray
      .map(({ rewardTokenAmount: reward }) => reward?.currency)
      .filter(currency => currency && currency !== undefined) as Currency[]

    if (filteredRewardsArray.length !== 0) return filteredRewardsArray
    else return undefined
  }, [rewardsArray])

  const handlePairSelection = useCallback(
    (selectedPair: Currency) => {
      const checkIfSelectedPairExists = disabledRewardsArray?.some(currency => currencyEquals(currency, selectedPair))
      if (currentReward !== undefined && !checkIfSelectedPairExists) {
        setRewardsArray({
          type: ActionType.REWARD_CHANGE,
          payload: {
            index: currentReward,
            reward: new TokenAmount(selectedPair as Token, '0'),
          },
        })
      }
    },
    [currentReward, setRewardsArray, disabledRewardsArray]
  )

  const handleCurrencyReset = useCallback(
    (index: number) => {
      setRewardsArray({
        type: ActionType.REMOVE_REWARD,
        payload: { index: index },
      })
    },
    [setRewardsArray]
  )

  const handleLocalUserInput = useCallback(
    (rawValue: string | undefined, index: number) => {
      const newParsedAmount = tryParseAmount(rawValue, rewardsArray[index]?.rewardTokenAmount?.currency) as
        | TokenAmount
        | undefined
      const currentCurrency = rewardsArray[index]?.rewardTokenAmount?.token

      setRewardsArray({
        type: ActionType.REWARD_CHANGE,
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
      <FlexWrapper justifyContent="center" marginTop="32px" flexWrap="wrap">
        {rewardsArray.map((item, index) => (
          <AssetSelector
            key={index}
            currency0={item.rewardTokenAmount?.token}
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
            amount={item.rewardTokenAmount}
            handleUserInput={event => {
              handleLocalUserInput(event, index)
            }}
            isReward={true}
            setRewardsObject={setRewardsArray}
            onResetCurrency={() => handleCurrencyReset(index)}
            index={index}
            rawAmount={item.rewardRawAmount}
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
