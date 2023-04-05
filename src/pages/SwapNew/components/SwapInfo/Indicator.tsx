import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../../../assets/swapbox/dexes.svg'
import { ReactComponent as GasSVG } from '../../../../assets/swapbox/gas.svg'
import { ReactComponent as MagnifyingGlassSVG } from '../../../../assets/swapbox/magnifying-glass.svg'
import { ReactComponent as ShieldSVG } from '../../../../assets/swapbox/shield.svg'
import {
  INDICATOR_BACKGROUND_COLOR,
  INDICATOR_COLOR,
  IndicatorColorVariant,
  IndicatorIconVariant,
} from '../../constants'

export const INDICATOR_ICON = {
  [IndicatorIconVariant.DEXES]: <DexesSVG />,
  [IndicatorIconVariant.GAS]: <GasSVG />,
  [IndicatorIconVariant.BANANA]: <BananaSVG />,
  [IndicatorIconVariant.SHIELD]: <ShieldSVG />,
  [IndicatorIconVariant.MAGNIFYING_GLASS]: <MagnifyingGlassSVG />,
} as const

type IndicatorProps = {
  color: IndicatorColorVariant
  icon?: IndicatorIconVariant
  text?: string
}

export function Indicator({ color, icon, text }: IndicatorProps) {
  return (
    <Container color={color}>
      {icon && INDICATOR_ICON[icon]}
      {text}
    </Container>
  )
}

const Container = styled.div<{ color: IndicatorColorVariant }>`
  height: 20px;
  display: inline-flex;
  vertical-align: top;
  align-items: center;
  gap: 4px;
  padding: 5px;
  line-height: 11px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ color }) => INDICATOR_COLOR[color]};
  background: ${({ color }) => INDICATOR_BACKGROUND_COLOR[color]};
  border-radius: 4px;
  box-shadow: 0px 0px 8px rgba(16, 158, 110, 0.15);
  margin-right: 4px;

  & .svg-path {
    fill: ${({ color }) => INDICATOR_COLOR[color]};
  }
`
