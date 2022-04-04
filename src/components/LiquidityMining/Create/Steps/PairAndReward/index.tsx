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
import { ReactComponent as CheckMark } from '../../../../../assets/svg/checkmark.svg'

const FlexContainer = styled(Flex)`
  ${props => props.theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
  `}
`
const StyledNumericalInput = styled(NumericalInput)`
  border-radius: 8px;

  width: 36px;
  max-height: 38px;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  text-transform: uppercase;

  background-color: ${props => props.theme.dark1};
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
          backgroundColor={
            'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(155.07deg, rgba(90, 12, 255, 0.1) 9.42%, rgba(17, 8, 35, 0) 92.21%);'
          }
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
            <Flex
              onClick={() => {
                onUnlimitedPoolChange(!unlimitedPool)
              }}
              alignItems={'center'}
              width={'127px'}
              height={'38px'}
              backgroundColor={'#000000A6'}
              padding={'12px 8px'}
            >
              <CheckMark />
              <TYPE.largeHeader marginLeft={'8px'} color="lightPurple" fontSize={13} letterSpacing="0.08em">
                {unlimitedPool ? 'UNLIMITED' : 'LIMITED'}
              </TYPE.largeHeader>
            </Flex>
            <Flex>
              <StyledNumericalInput
                disabled={unlimitedPool}
                value={stakingCapString}
                onUserInput={handleLocalStakingCapChange}
              />
              <TYPE.largeHeader
                alignSelf={'center'}
                fontSize={13}
                color={'lightPurple'}
                letterSpacing="0.08em"
                alignItems={'center'}
              >
                {liquidityPair && liquidityPair instanceof Pair
                  ? `${unwrappedToken(liquidityPair.token0)?.symbol}/${unwrappedToken(liquidityPair.token1)?.symbol}`
                  : liquidityPair instanceof Token
                  ? unwrappedToken(liquidityPair)?.symbol
                  : ''}
              </TYPE.largeHeader>
            </Flex>
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
