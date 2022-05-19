import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SmoothGradientCard } from '../../../../styleds'
import styled from 'styled-components'
import Loader from '../../../../../Loader'
import Slider from '../../../../../Slider'

import useDebouncedChangeHandler from '../../../../../../utils/useDebouncedChangeHandler'
import { Pair, Price, Token, TokenAmount } from '@swapr/sdk'
import { useTokenOrPairNativeCurrency } from '../../../../../../hooks/useTokenOrPairNativeCurrency'
import { parseUnits } from 'ethers/lib/utils'
import { calculatePercentage } from '../../../../../../utils'
import { Flex } from 'rebass'
import { ReactComponent as CashIcon } from '../../../../../../assets/svg/cash-icon.svg'
import { ReactComponent as CryptoIcon } from '../../../../../../assets/svg/crypto-icon.svg'
import { ReactComponent as RefreshIcon } from '../../../../../../assets/svg/refresh-icon.svg'
import NumericalInput from '../../../../../Input/NumericalInput'
import { TYPE } from '../../../../../../theme'

const SwitchContainer = styled.div`
  font-size: 10px;
  display: flex;
  font-weight: 600;
  color: ${props => props.theme.text5};
  line-height: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`
const SimulatedValue = styled.div`
  font-family: 'Fira Mono';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 22px;
  /* identical to box height */

  text-align: right;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: ${props => props.theme.text2};
`
const AmountFlex = styled(Flex)`
  height: 28px;
  width: max-content;
  align-self: center;
`

const SimulateOption = styled.div<{ isActive: boolean }>`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: ${props => (props.isActive ? props.theme.text2 : props.theme.lightPurple2)};
  ${props => props.isActive && 'text-decoration: underline; text-underline-offset: 7px;'};
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

const dollarAmountMaxSimulation = 10000000

interface RewardSummaryProps {
  tokenOrPair: Token | Pair | null
  stakingCap: TokenAmount | null
  nativeCurrencyUSDPrice: Price
  setSimulatedStakedAmount: (value: string) => void
  setSimulatedPrice: (value: any) => void
  simulatedPrice: any
  loading: boolean
}
enum SimulateOptions {
  AMOUNT = 'Amount',
  PRICE = 'Price',
}

export default function SimulateStaking({
  tokenOrPair,
  stakingCap,
  setSimulatedStakedAmount,
  setSimulatedPrice,
  simulatedPrice,
  nativeCurrencyUSDPrice,
  loading,
}: RewardSummaryProps) {
  const { loading: loadingNativeTokenPrice, derivedNativeCurrency: nativeTokenPrice } = useTokenOrPairNativeCurrency(
    tokenOrPair ? tokenOrPair : undefined
  )

  const inputRef = React.useRef<HTMLInputElement>(null)
  const widthValue = useMemo(() => {
    if (simulatedPrice.length > 0 && inputRef.current) return inputRef.current.clientWidth
    else return 18
  }, [simulatedPrice, inputRef])
  const handleLocalStakingCapChange = useCallback(
    rawValue => {
      setSimulatedPrice(rawValue.length === 0 ? '0' : rawValue)
    },
    [setSimulatedPrice]
  )
  useEffect(() => {
    setSimulatedPrice(parseFloat(nativeTokenPrice.multiply(nativeCurrencyUSDPrice).toFixed(2)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [simulateOption, setSimulateOption] = useState<SimulateOptions>(SimulateOptions.AMOUNT)
  const [showUSDValue, setShowUSDValue] = useState(true)
  const [simulatedValuePercentage, setSimulatedValuePercentage] = useState(0)
  const liquidityPercentChangeCallback = useCallback((value: number) => {
    setSimulatedValuePercentage(value)
  }, [])
  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    simulatedValuePercentage,
    liquidityPercentChangeCallback,
    10
  )
  const maxStakedSimulatedAmount = useMemo(() => {
    const base = stakingCap
      ? parseFloat(stakingCap.multiply(simulatedPrice).toSignificant(22))
      : dollarAmountMaxSimulation

    const baseInUsd = parseFloat(simulatedPrice)

    const baseValue = showUSDValue ? base : base / baseInUsd

    const baseCurrency = tokenOrPair instanceof Token ? tokenOrPair : tokenOrPair?.liquidityToken

    if (baseCurrency && base !== 0 && baseInUsd !== 0) {
      setSimulatedStakedAmount(
        parseUnits(
          calculatePercentage(base / baseInUsd, simulatedValuePercentage).toString(),
          baseCurrency.decimals
        ).toString()
      )
    }

    return calculatePercentage(baseValue, simulatedValuePercentage)
  }, [setSimulatedStakedAmount, tokenOrPair, simulatedPrice, simulatedValuePercentage, stakingCap, showUSDValue])
  const handleUSDValueClick = useCallback(() => {
    setShowUSDValue(!showUSDValue)
  }, [showUSDValue])
  return (
    <SmoothGradientCard
      justifyContent={'space-between !important'}
      flexDirection={'column'}
      alignItems={'center'}
      padding={'24px 28px'}
      width={'50%'}
    >
      <Flex width={'100%'} justifyContent={'space-between'}>
        <SimulateOption
          onClick={() => setSimulateOption(SimulateOptions.AMOUNT)}
          isActive={simulateOption === SimulateOptions.AMOUNT}
        >
          SIMULATED STAKING
        </SimulateOption>
        <SimulateOption
          onClick={() => setSimulateOption(SimulateOptions.PRICE)}
          isActive={simulateOption === SimulateOptions.PRICE}
        >
          SIMULATED PRICE
        </SimulateOption>
      </Flex>

      {SimulateOptions.AMOUNT === simulateOption && (
        <>
          {loading || loadingNativeTokenPrice ? (
            <Loader />
          ) : (
            <SimulatedValue>
              {maxStakedSimulatedAmount.toLocaleString('en-us')}{' '}
              {showUSDValue
                ? 'USD'
                : tokenOrPair instanceof Token
                ? tokenOrPair.symbol
                : `${tokenOrPair?.token0.symbol}/${tokenOrPair?.token1.symbol}`}
            </SimulatedValue>
          )}
          <Slider value={innerLiquidityPercentage} size={16} onChange={setInnerLiquidityPercentage} />
        </>
      )}
      {SimulateOptions.PRICE === simulateOption && (
        <AmountFlex>
          <StyledNumericalInput
            style={{ width: widthValue + 12 + 'px' }}
            value={simulatedPrice}
            onUserInput={handleLocalStakingCapChange}
          />
          <span style={{ visibility: 'hidden', position: 'absolute' }} ref={inputRef}>
            {simulatedPrice}
          </span>

          <TYPE.largeHeader
            alignSelf={'center'}
            fontSize={13}
            color={'text3'}
            letterSpacing="0.08em"
            alignItems={'center'}
          >
            USD
          </TYPE.largeHeader>
        </AmountFlex>
      )}

      <Flex width={'100%'} justifyContent={'space-between'}>
        <SwitchContainer onClick={handleUSDValueClick}>
          {showUSDValue ? <CashIcon /> : <CryptoIcon />} SHOW IN {showUSDValue ? 'CRYPTO' : 'USD'}
        </SwitchContainer>
        <SwitchContainer>
          RESET <RefreshIcon />
        </SwitchContainer>
      </Flex>
    </SmoothGradientCard>
  )
}
