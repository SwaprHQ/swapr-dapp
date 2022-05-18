import React, { useCallback, useMemo, useState } from 'react'

import { TYPE } from '../../../../../../theme'
import { SmoothGradientCard } from '../../../../styleds'
import styled from 'styled-components'
import Loader from '../../../../../Loader'
import Slider from '../../../../../Slider'
import { Repeat } from 'react-feather'
import useDebouncedChangeHandler from '../../../../../../utils/useDebouncedChangeHandler'
import { Pair, Price, Token, TokenAmount } from '@swapr/sdk'
import { useTokenOrPairNativeCurrency } from '../../../../../../hooks/useTokenOrPairNativeCurrency'
import { parseUnits } from 'ethers/lib/utils'
import { calculatePercentage } from '../../../../../../utils'

const SwitchContainer = styled.div`
  font-size: 10px;
  display: flex;
  font-weight: 600;
  color: ${props => props.theme.text5};
  line-height: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
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
const StyledSwitch = styled(Repeat)`
  width: 12px;
  height: 12px;
  stroke: ${props => props.theme.text5};
  margin-left: 4px;
`
const dollarAmountMaxSimulation = 10000000

interface RewardSummaryProps {
  tokenOrPair: Token | Pair | null
  stakingCap: TokenAmount | null
  nativeCurrencyUSDPrice: Price
  setSimulatedStakedAmount: (value: string) => void
  loading: boolean
}

export default function SimulateStaking({
  tokenOrPair,
  stakingCap,
  setSimulatedStakedAmount,
  nativeCurrencyUSDPrice,
  loading,
}: RewardSummaryProps) {
  const { loading: loadingNativeTokenPrice, derivedNativeCurrency: nativeTokenPrice } = useTokenOrPairNativeCurrency(
    tokenOrPair ? tokenOrPair : undefined
  )
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
      ? parseFloat(stakingCap.multiply(nativeTokenPrice.multiply(nativeCurrencyUSDPrice)).toSignificant(22))
      : dollarAmountMaxSimulation

    const baseInUsd = parseFloat(nativeTokenPrice.multiply(nativeCurrencyUSDPrice).toFixed(22))

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
  }, [
    setSimulatedStakedAmount,
    tokenOrPair,
    simulatedValuePercentage,
    stakingCap,
    nativeTokenPrice,
    nativeCurrencyUSDPrice,
    showUSDValue,
  ])
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
      <TYPE.largeHeader fontSize={'11px'} letterSpacing="0.08em" color="text3">
        SIMULATED STAKED AMOUNT
      </TYPE.largeHeader>
      <SwitchContainer onClick={handleUSDValueClick}>
        Value in {showUSDValue ? 'crypto' : 'USD'}
        <StyledSwitch />
      </SwitchContainer>
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
    </SmoothGradientCard>
  )
}
