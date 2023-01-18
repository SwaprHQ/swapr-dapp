import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../../assets/swapbox/dexes.svg'
import { ReactComponent as GasSVG } from '../../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../../assets/swapbox/shield.svg'
import { INDICATOR_BACKGROUND_COLOR, INDICATOR_COLOR, IndicatorColorVariant, IndicatorIconVariant } from '../constants'

export const INDICATOR_ICON = {
  [IndicatorIconVariant.DEXES]: <DexesSVG />,
  [IndicatorIconVariant.GAS]: <GasSVG />,
  [IndicatorIconVariant.BANANA]: <BananaSVG />,
  [IndicatorIconVariant.SHIELD]: <ShieldSVG />,
}

type IndicatorProps = {
  color: IndicatorColorVariant
  icon: IndicatorIconVariant
}

export function Indicator({ color, icon }: IndicatorProps) {
  return <Container color={color}>{INDICATOR_ICON[icon]}</Container>
}

const Container = styled.div<{ color: IndicatorColorVariant }>`
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 5px;
  background: ${({ color }) => INDICATOR_BACKGROUND_COLOR[color]};
  border-radius: 4px;
  border: 1px solid ${({ color }) => INDICATOR_COLOR[color]};
  box-shadow: 0px 0px 8px rgba(16, 158, 110, 0.15);
  margin-right: 4px;

  & .svg-path {
    fill: ${({ color }) => INDICATOR_COLOR[color]};
  }
`
