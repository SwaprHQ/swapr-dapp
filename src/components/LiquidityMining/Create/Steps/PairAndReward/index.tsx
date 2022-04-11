import { Pair, Token, TokenAmount } from '@swapr/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import { tryParseAmount } from '../../../../../state/swap/hooks'
import { TYPE } from '../../../../../theme'
import { unwrappedToken } from '../../../../../utils/wrappedCurrency'
import NumericalInput from '../../../../Input/NumericalInput'
import CurrencySearchModal from '../../../../SearchModal/CurrencySearchModal'
import PairSearchModal from '../../../../SearchModal/PairSearchModal'
import { SmoothGradientCard } from '../../../styleds'
import AssetSelector from './AssetSelector'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`
const AmountFlex = styled(Flex)<{ active: boolean }>`
  border-bottom: 1px solid ${props => (props.active ? 'white' : 'transparent')};
  height: 28px;
  width: max-content;
  align-self: center;
`
const StyledUnlimitedText = styled(TYPE.largeHeader)<{ active: boolean }>`
  text-decoration: ${props => (props.active ? 'underline' : 'none')};
  text-underline-offset: 7px;

  color: ${props => (props.active ? props.theme.text2 : props.theme.dark4)};
  font-size: 13px !important;
  letter-spacing: 0.08em;
`
const StyledNumericalInput = styled(NumericalInput)`
  color: ${props => props.theme.text2};
  width: 36px;
  max-height: 38px;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  text-transform: uppercase;
  ::placeholder {
    color: ${props => props.theme.text2};
  }
`
const StyledFlex = styled(Flex)`
  border-radius: 4px;
`

interface TokenAndLimitProps {
  targetedPairOrToken: Pair | Token | undefined | null
  unlimitedPool: boolean
  campaingType: CampaignType
  onLiquidityPairChange: (liquidityPair: Pair | Token | null) => void
  onStakingCapChange: (newValue: TokenAmount | null) => void
  onUnlimitedPoolChange: (newValue: boolean) => void
}

export default function TokenAndLimit({
  targetedPairOrToken: liquidityPair,
  unlimitedPool,
  onLiquidityPairChange,
  campaingType,
  onStakingCapChange,
  onUnlimitedPoolChange
}: TokenAndLimitProps) {
  const [pairSearchOpen, setPairSearchOpen] = useState<boolean>(false)
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)
  const [stakingCapString, setStakingCapString] = useState('')
  const [inputWidth, setInputWidth] = useState(3)

  useEffect(() => {
    if (unlimitedPool) {
      setStakingCapString('')
      onStakingCapChange(null)
    }
  }, [onStakingCapChange, liquidityPair, unlimitedPool])
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
      onLiquidityPairChange(selectedPair)
    },
    [onLiquidityPairChange]
  )

  const handleDismissCurrencySearch = useCallback(() => {
    setCurrencySearchOpen(false)
  }, [])
  useEffect(() => {
    onLiquidityPairChange(null)
  }, [campaingType, onLiquidityPairChange])
  const handleLocalStakingCapChange = useCallback(
    rawValue => {
      setInputWidth(rawValue.length < 3 ? 3 : rawValue.length)
      if (!liquidityPair || (liquidityPair instanceof Pair && !liquidityPair.liquidityToken)) return
      setStakingCapString(rawValue)
      const tokenOrPair = liquidityPair instanceof Token ? liquidityPair : liquidityPair.liquidityToken
      const parsedAmount = tryParseAmount(rawValue, tokenOrPair) as TokenAmount | undefined
      onStakingCapChange(parsedAmount || new TokenAmount(tokenOrPair, '0'))
    },
    [onStakingCapChange, liquidityPair]
  )

  return (
    <>
      <FlexContainer marginTop={'32px'} justifyContent="stretch" width="100%" height={'150px'}>
        <AssetSelector
          campaingType={campaingType}
          currency0={liquidityPair && liquidityPair instanceof Token ? liquidityPair : liquidityPair?.token0}
          currency1={liquidityPair && liquidityPair instanceof Token ? null : liquidityPair?.token1}
          onClick={() => handelOpenPairOrTokenSearch(campaingType)}
        />

        <SmoothGradientCard
          justifyContent={'space-between !important'}
          flexDirection={'column'}
          padding={'41px'}
          marginLeft={'28px'}
          width="301px"
        >
          <TYPE.mediumHeader
            alignSelf={'start'}
            letterSpacing="0.08em"
            color="text3"
            fontSize={13}
            fontWeight="600"
            lineHeight="22px"
          >
            MAX STAKED
          </TYPE.mediumHeader>
          <FlexContainer width={'100%'} justifyContent={'space-between '}>
            <StyledFlex onClick={() => onUnlimitedPoolChange(true)} alignItems={'center'} height={'38px'}>
              <StyledUnlimitedText active={unlimitedPool}>UNLIMITED</StyledUnlimitedText>
            </StyledFlex>
            <AmountFlex active={!unlimitedPool}>
              <StyledNumericalInput
                style={{ width: inputWidth + 'ch' }}
                onClick={() => onUnlimitedPoolChange(false)}
                disabled={!liquidityPair}
                value={stakingCapString}
                onUserInput={handleLocalStakingCapChange}
              />
              <TYPE.largeHeader
                alignSelf={'center'}
                fontSize={13}
                color={'text3'}
                letterSpacing="0.08em"
                alignItems={'center'}
              >
                {liquidityPair && liquidityPair instanceof Pair
                  ? `${unwrappedToken(liquidityPair.token0)?.symbol}/${unwrappedToken(liquidityPair.token1)?.symbol}`
                  : liquidityPair instanceof Token
                  ? unwrappedToken(liquidityPair)?.symbol
                  : ''}
              </TYPE.largeHeader>
            </AmountFlex>
          </FlexContainer>
        </SmoothGradientCard>
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
