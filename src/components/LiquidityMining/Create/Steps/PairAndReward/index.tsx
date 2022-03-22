import { Pair, Token } from '@swapr/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import PairSearchModal from '../../../../SearchModal/PairSearchModal'
import AssetSelector from './AssetSelector'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`

interface PairAndRewardProps {
  liquidityPair: Pair | Token | undefined | null

  campaingType: CampaignType
  onLiquidityPairChange: (liquidityPair: Pair | Token | null) => void
}

export default function PairAndReward({
  liquidityPair,

  onLiquidityPairChange,

  campaingType
}: PairAndRewardProps) {
  const [pairSearchOpen, setPairSearchOpen] = useState<boolean>(false)
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)

  const handelOpenPairOrTokenSearch = useCallback(value => {
    if (value === CampaignType.PAIR) {
      setPairSearchOpen(true)
    } else {
      setCurrencySearchOpen(true)
    }
  }, [])

  const handleDismissPairSearch = useCallback(() => {
    setPairSearchOpen(false)
  }, [])

  const handlePairSelection = useCallback(
    selectedPair => {
      if (campaingType === CampaignType.PAIR) onLiquidityPairChange(selectedPair)
      else onLiquidityPairChange(selectedPair)
    },
    [onLiquidityPairChange, campaingType]
  )

  const handleDismissCurrencySearch = useCallback(() => {
    setCurrencySearchOpen(false)
  }, [])
  useEffect(() => {
    onLiquidityPairChange(null)
  }, [campaingType, onLiquidityPairChange])

  return (
    <>
      <FlexContainer justifyContent="stretch" width="100%">
        <AssetSelector
          campaingType={campaingType}
          currency0={liquidityPair && liquidityPair instanceof Token ? liquidityPair : liquidityPair?.token0}
          currency1={liquidityPair && liquidityPair instanceof Token ? null : liquidityPair?.token1}
          onClick={() => handelOpenPairOrTokenSearch(campaingType)}
        />

        <Flex width="301px">Divcibare</Flex>
      </FlexContainer>

      <PairSearchModal
        isOpen={pairSearchOpen}
        onDismiss={handleDismissPairSearch}
        onPairSelect={handlePairSelection}
        selectedPair={liquidityPair instanceof Token ? null : liquidityPair}
      />
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissCurrencySearch}
        onCurrencySelect={handlePairSelection}
        selectedCurrency={liquidityPair instanceof Token ? liquidityPair : null}
        showNativeCurrency={false}
      />
    </>
  )
}
