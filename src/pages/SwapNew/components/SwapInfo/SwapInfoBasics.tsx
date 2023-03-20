import { Trade } from '@swapr/sdk'

import styled from 'styled-components'

import { ReactComponent as DownArrowSmallSVG } from '../../../../assets/swapbox/down-arrow-small.svg'
import { IndicatorColorVariant, IndicatorIconVariant, TEXT_COLOR_PRIMARY } from '../../constants'
import { FontFamily } from '../styles'
import { Indicator } from './Indicator'

type SwapInfoBasicsProps = {
  allPlatformTrades?: (Trade | undefined)[]
  toggleShowInfoDetails: () => void
}

export function SwapInfoBasics({ allPlatformTrades, toggleShowInfoDetails }: SwapInfoBasicsProps) {
  const getNumberOfPlatforms = () => `${allPlatformTrades!.filter(Boolean).length}/${allPlatformTrades!.length}`

  return (
    <Container>
      <SwapCostInfo>
        {allPlatformTrades?.length !== 0 && (
          <Indicator
            color={IndicatorColorVariant.POSITIVE}
            icon={IndicatorIconVariant.DEXES}
            text={getNumberOfPlatforms()}
          />
        )}
        <Indicator color={IndicatorColorVariant.WARNING} icon={IndicatorIconVariant.GAS} />
        <Indicator color={IndicatorColorVariant.NEGATIVE} icon={IndicatorIconVariant.BANANA} />
        <Indicator color={IndicatorColorVariant.UNDEFINED} icon={IndicatorIconVariant.SHIELD} />
        <CurrencyCourseInfo>
          <span>1</span> ETH = <span>3007</span> USDT
        </CurrencyCourseInfo>
      </SwapCostInfo>
      <ExpandButton onClick={toggleShowInfoDetails}>
        <DownArrowSmallSVG />
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

const CurrencyCourseInfo = styled.p`
  height: 20px;
  line-height: 20px;
  display: inline-block;
  vertical-align: top;
  padding: 5px 6px;
  border-radius: 4px;
  line-height: 10px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 500;
  text-transform: uppercase;
  opacity: 0.8;
  color: ${TEXT_COLOR_PRIMARY};
  background: rgba(104, 110, 148, 0.1);

  & span {
    opacity: 1;
    font-weight: 700;
  }
`
