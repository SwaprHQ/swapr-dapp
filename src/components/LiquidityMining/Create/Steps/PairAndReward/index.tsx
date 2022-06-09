import { Pair, Token, TokenAmount } from '@swapr/sdk'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { CampaignType } from '../../../../../pages/LiquidityMining/Create'
import { tryParseAmount } from '../../../../../state/swap/hooks'
import { TYPE } from '../../../../../theme'
import { unwrappedToken } from '../../../../../utils/wrappedCurrency'
import { NumericalInput } from '../../../../Input/NumericalInput'
import { CurrencySearchModal } from '../../../../SearchModal/CurrencySearchModal'
import { PairSearchModal } from '../../../../SearchModal/PairSearchModal'
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
const AmountFlex = styled(Flex)`
  width: max-content;
  align-self: center;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  padding: 12px;
`
const StyledUnlimitedText = styled(TYPE.largeHeader)<{ active: boolean }>`
  text-decoration: ${({ active }) => (active ? 'underline' : 'none')};
  opacity: ${({ active }) => !active && '0.7'};
  text-underline-offset: 6px;
  line-height: 22px;
  color: ${({ active, theme }) => (active ? theme.text2 : theme.dark4)};
  font-size: 13px !important;
  letter-spacing: 0.08em;
`
const StyledNumericalInput = styled(NumericalInput)<{ selected: boolean }>`
  color: ${({ theme, selected }) => (selected ? theme.text2 : theme.bg2)};
  width: 36px;
  max-height: 38px;
  font-weight: 600;
  font-size: 16px;
  line-height: 26px;
  text-transform: uppercase;
  ::placeholder {
    color: ${({ theme, selected }) => (selected ? theme.text2 : theme.bg2)};
  }
`
const StyledFlex = styled(Flex)<{ active: boolean }>`
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  padding: 12px;
  padding-top: ${({ active }) => active && '8px'};
`
const BorderContainer = styled(Flex)<{ active: boolean }>`
  border-bottom: 1px solid ${({ active }) => (active ? 'white' : 'transparent')};
  opacity: ${({ active }) => !active && '0.7'};
`

interface TokenAndLimitProps {
  unlimitedPool: boolean
  campaingType: CampaignType

  onStakingCapChange: (newValue: TokenAmount | null) => void
  onUnlimitedPoolChange: (newValue: boolean) => void
  stakeToken?: Token
  stakePair?: Pair
  setStakeToken: (token: Token | undefined) => void
  setStakePair: (pair: Pair | undefined) => void
}

export default function StakeTokenAndLimit({
  stakeToken,
  stakePair,
  setStakeToken,
  setStakePair,
  unlimitedPool,
  campaingType,
  onStakingCapChange,
  onUnlimitedPoolChange,
}: TokenAndLimitProps) {
  const [pairSearchOpen, setPairSearchOpen] = useState<boolean>(false)
  const [currencySearchOpen, setCurrencySearchOpen] = useState<boolean>(false)
  const [stakingCapString, setStakingCapString] = useState('')

  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (unlimitedPool) {
      setStakingCapString('')
      onStakingCapChange(null)
    }
  }, [onStakingCapChange, stakeToken, stakePair, unlimitedPool])

  const handleOpenPairOrTokenSearch = useCallback(value => {
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
      setStakePair(selectedPair)
    },
    [setStakePair]
  )
  const handleTokenSelection = useCallback(
    selectedToken => {
      setStakeToken(selectedToken)
    },
    [setStakeToken]
  )

  useEffect(() => {
    setStakePair(undefined)
    setStakeToken(undefined)
  }, [campaingType, setStakeToken, setStakePair])

  const widthValue = useMemo(() => {
    if (stakingCapString.length > 0 && inputRef.current) return inputRef.current.clientWidth
    else return 0
  }, [stakingCapString, inputRef])

  const handleLocalStakingCapChange = useCallback(
    rawValue => {
      let tokenOrPair: Token
      if (stakeToken) tokenOrPair = stakeToken
      else if (stakePair?.liquidityToken) tokenOrPair = stakePair.liquidityToken
      else return
      setStakingCapString(rawValue)

      const parsedAmount = tryParseAmount(rawValue, tokenOrPair) as TokenAmount | undefined
      onStakingCapChange(parsedAmount || new TokenAmount(tokenOrPair, '0'))
    },
    [onStakingCapChange, stakeToken, stakePair]
  )

  return (
    <>
      <FlexContainer marginTop={'32px'}>
        <AssetSelector
          campaingType={campaingType}
          currency0={stakeToken || stakePair?.token0}
          currency1={stakePair?.token1}
          onClick={() => handleOpenPairOrTokenSearch(campaingType)}
        />

        <SmoothGradientCard
          justifyContent={'space-between'}
          flexDirection={'column'}
          padding={'33.45px 41px'}
          height="150px"
          width="fit-content"
          disabled={!stakeToken && !stakePair}
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
          <FlexContainer marginTop="16px" flexDirection={'row'} width={'100%'} justifyContent={'space-between '}>
            <StyledFlex
              marginRight="20px"
              onClick={() => onUnlimitedPoolChange(true)}
              alignItems={'center'}
              active={unlimitedPool}
            >
              <StyledUnlimitedText active={unlimitedPool}>UNLIMITED</StyledUnlimitedText>
            </StyledFlex>
            <AmountFlex onClick={() => onUnlimitedPoolChange(false)}>
              <BorderContainer active={!unlimitedPool}>
                <StyledNumericalInput
                  style={{ width: widthValue + 12 + 'px' }}
                  placeholder="0"
                  selected={!unlimitedPool}
                  disabled={!stakeToken && !stakePair}
                  value={stakingCapString}
                  onUserInput={handleLocalStakingCapChange}
                />
                <span style={{ visibility: 'hidden', position: 'absolute' }} ref={inputRef}>
                  {stakingCapString}
                </span>

                <TYPE.largeHeader
                  alignSelf={'center'}
                  fontSize={13}
                  marginLeft={'9px'}
                  color={unlimitedPool ? 'dark4' : 'text2'}
                  letterSpacing="0.08em"
                  alignItems={'center'}
                  lineHeight="22px"
                >
                  {stakePair
                    ? `${unwrappedToken(stakePair.token0)?.symbol}/${unwrappedToken(stakePair.token1)?.symbol}`
                    : stakeToken
                    ? unwrappedToken(stakeToken)?.symbol
                    : ''}
                </TYPE.largeHeader>
              </BorderContainer>
            </AmountFlex>
          </FlexContainer>
        </SmoothGradientCard>
      </FlexContainer>

      <PairSearchModal
        isOpen={pairSearchOpen}
        onDismiss={() => handleDismissTokenOrPairSelection(CampaignType.PAIR)}
        onPairSelect={handlePairSelection}
        selectedPair={stakePair}
      />
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={() => handleDismissTokenOrPairSelection(CampaignType.TOKEN)}
        onCurrencySelect={handleTokenSelection}
        selectedCurrency={stakeToken}
        showNativeCurrency={false}
      />
    </>
  )
}
