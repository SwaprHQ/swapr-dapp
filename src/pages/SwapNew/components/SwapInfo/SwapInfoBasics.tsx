import { Trade, CoWTrade } from '@swapr/sdk'

import styled from 'styled-components'

import { ReactComponent as DownArrowSmallSVG } from '../../../../assets/swapbox/down-arrow-small.svg'
import { useUserSlippageTolerance } from '../../../../state/user/hooks'
import { IndicatorColorVariant, IndicatorIconVariant } from '../../constants'
import { CurrenciesConversionRate } from './CurrenciesConversionRate'
import { Indicator } from './Indicator'

type SwapInfoBasicsProps = {
  selectedTrade?: Trade
  allPlatformTrades?: (Trade | undefined)[]
  showSwapInfoDetails: boolean
  toggleShowInfoDetails: () => void
}

export function SwapInfoBasics({
  selectedTrade,
  allPlatformTrades,
  showSwapInfoDetails,
  toggleShowInfoDetails,
}: SwapInfoBasicsProps) {
  const getNumberOfPlatforms = () => `${allPlatformTrades!.filter(Boolean).length}/${allPlatformTrades!.length}`

  const userSlippageTolerance = useUserSlippageTolerance()

  return (
    <Container>
      <SwapCostInfo>
        {allPlatformTrades?.length !== 0 && (
          <Indicator
            color={IndicatorColorVariant.POSITIVE}
            icon={IndicatorIconVariant.MAGNIFYING_GLASS}
            text={getNumberOfPlatforms()}
          />
        )}
        <Indicator color={IndicatorColorVariant.WARNING} icon={IndicatorIconVariant.GAS} />
        <Indicator
          color={!!userSlippageTolerance ? IndicatorColorVariant.POSITIVE : IndicatorColorVariant.NEGATIVE}
          icon={IndicatorIconVariant.BANANA}
          text={`${(userSlippageTolerance / 100).toFixed(1)}%`}
        />
        <Indicator
          color={selectedTrade instanceof CoWTrade ? IndicatorColorVariant.POSITIVE : IndicatorColorVariant.UNDEFINED}
          icon={IndicatorIconVariant.SHIELD}
        />
        <CurrenciesConversionRate price={selectedTrade?.executionPrice} />
      </SwapCostInfo>
      <ExpandButton onClick={toggleShowInfoDetails}>
        <DownArrowSmall showSwapInfoDetails={showSwapInfoDetails} />
      </ExpandButton>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SwapCostInfo = styled.div``

const ExpandButton = styled.button`
  height: 20px;
  width: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: transparent;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`

const DownArrowSmall = styled(DownArrowSmallSVG)<{ showSwapInfoDetails: boolean }>`
  transition: all 0.2s ease;
  transform: ${({ showSwapInfoDetails }) => (showSwapInfoDetails ? 'rotate(180deg)' : 'rotate(0deg)')};
`
