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
  justify-content: stretch;
  width: 100%;
  gap: 28px;
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
  stakeTokenOrPair: Pair | Token | undefined | null
  unlimitedPool: boolean
  campaingType: CampaignType
  setStakeTokenOrPair: (liquidityPair: Pair | Token | null) => void
  onStakingCapChange: (newValue: TokenAmount | null) => void
  onUnlimitedPoolChange: (newValue: boolean) => void
}

export default function StakeTokenAndLimit({
  stakeTokenOrPair,
  unlimitedPool,
  setStakeTokenOrPair,
  campaingType,
  onStakingCapChange,
  onUnlimitedPoolChange
}: TokenAndLimitProps) {
  const [pairSearchOpen, setPairSearchOpen] = useState<boolean>(false)
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)
  const [stakingCapString, setStakingCapString] = useState('')
  const [inputWidth, setInputWidth] = useState(18)
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (unlimitedPool) {
      setStakingCapString('')
      setInputWidth(18)
      onStakingCapChange(null)
    }
  }, [onStakingCapChange, stakeTokenOrPair, unlimitedPool])

  const handelOpenPairOrTokenSearch = useCallback(value => {
    if (value === CampaignType.PAIR) {
      setPairSearchOpen(true)
    } else {
      setCurrencySearchOpen(true)
    }
  }, [])

  const handleDismissTokenOrPairSelection = useCallback((type: CampaignType) => {
    if (type === CampaignType.TOKEN) setCurrencySearchOpen(false)
    else setPairSearchOpen(false)
  }, [])

  const handlePairSelection = useCallback(
    selectedPair => {
      setStakeTokenOrPair(selectedPair)
    },
    [setStakeTokenOrPair]
  )

  useEffect(() => {
    setStakeTokenOrPair(null)
  }, [campaingType, setStakeTokenOrPair])

  const handleLocalStakingCapChange = useCallback(
    rawValue => {
      if (rawValue.length === 0) setInputWidth(18)
      else setInputWidth(inputRef.current?.clientWidth || 4)

      if (!stakeTokenOrPair || (stakeTokenOrPair instanceof Pair && !stakeTokenOrPair.liquidityToken)) return
      setStakingCapString(rawValue)
      const tokenOrPair = stakeTokenOrPair instanceof Token ? stakeTokenOrPair : stakeTokenOrPair.liquidityToken
      const parsedAmount = tryParseAmount(rawValue, tokenOrPair) as TokenAmount | undefined
      onStakingCapChange(parsedAmount || new TokenAmount(tokenOrPair, '0'))
    },
    [onStakingCapChange, stakeTokenOrPair]
  )

  return (
    <>
      <FlexContainer marginTop={'32px'}>
        <AssetSelector
          campaingType={campaingType}
          currency0={
            stakeTokenOrPair && stakeTokenOrPair instanceof Token ? stakeTokenOrPair : stakeTokenOrPair?.token0
          }
          currency1={stakeTokenOrPair && stakeTokenOrPair instanceof Token ? null : stakeTokenOrPair?.token1}
          onClick={() => handelOpenPairOrTokenSearch(campaingType)}
        />

        <SmoothGradientCard
          justifyContent={'space-between !important'}
          flexDirection={'column'}
          padding={'41px'}
          height="150px"
          width="fit-content"
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
          <FlexContainer flexDirection={'row'} width={'100%'} justifyContent={'space-between '}>
            <StyledFlex
              marginRight="20px"
              onClick={() => onUnlimitedPoolChange(true)}
              alignItems={'center'}
              height={'38px'}
            >
              <StyledUnlimitedText active={unlimitedPool}>UNLIMITED</StyledUnlimitedText>
            </StyledFlex>
            <AmountFlex active={!unlimitedPool}>
              <StyledNumericalInput
                style={{ width: inputWidth + 12 + 'px' }}
                onClick={() => onUnlimitedPoolChange(false)}
                disabled={!stakeTokenOrPair}
                value={stakingCapString}
                onUserInput={handleLocalStakingCapChange}
              />
              <span style={{ visibility: 'hidden', position: 'absolute' }} ref={inputRef}>
                {stakingCapString}
              </span>

              <TYPE.largeHeader
                alignSelf={'center'}
                fontSize={13}
                color={'text3'}
                letterSpacing="0.08em"
                alignItems={'center'}
              >
                {stakeTokenOrPair && stakeTokenOrPair instanceof Pair
                  ? `${unwrappedToken(stakeTokenOrPair.token0)?.symbol}/${
                      unwrappedToken(stakeTokenOrPair.token1)?.symbol
                    }`
                  : stakeTokenOrPair instanceof Token
                  ? unwrappedToken(stakeTokenOrPair)?.symbol
                  : ''}
              </TYPE.largeHeader>
            </AmountFlex>
          </FlexContainer>
        </SmoothGradientCard>
      </FlexContainer>

      <PairSearchModal
        isOpen={pairSearchOpen}
        onDismiss={() => handleDismissTokenOrPairSelection(CampaignType.PAIR)}
        onPairSelect={handlePairSelection}
        selectedPair={stakeTokenOrPair instanceof Token ? null : stakeTokenOrPair}
      />
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={() => handleDismissTokenOrPairSelection(CampaignType.TOKEN)}
        onCurrencySelect={handlePairSelection}
        selectedCurrency={stakeTokenOrPair instanceof Token ? stakeTokenOrPair : null}
        showNativeCurrency={false}
      />
    </>
  )
}
