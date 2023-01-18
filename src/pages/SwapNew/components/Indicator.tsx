import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../../assets/swapbox/dexes.svg'
import { ReactComponent as GasSVG } from '../../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../../assets/swapbox/shield.svg'
import {
  INDICATOR_COLOR_NEGATIVE,
  INDICATOR_COLOR_POSITIVE,
  INDICATOR_COLOR_UNDEFINED,
  INDICATOR_COLOR_WARNING,
} from '../constants'

export enum IndicatorVariant {
  POSITIVE = 'POSITIVE',
  WARNING = 'WARNING',
  NEGATIVE = 'NEGATIVE',
  UNDEFINED = 'UNDEFINED',
}

type IndicatorProps = {
  variant: IndicatorVariant
  icon: 'dexes' | 'gas' | 'banana' | 'shield'
}

export function Indicator({ variant, icon }: IndicatorProps) {
  return (
    <Container variant={variant}>
      {(() => {
        switch (icon) {
          case 'dexes':
            return <DexesSVG />
          case 'gas':
            return <GasSVG />
          case 'banana':
            return <BananaSVG />
          case 'shield':
            return <ShieldSVG />
          default:
            return null
        }
      })()}
    </Container>
  )
}

const Container = styled.div<{ variant: IndicatorVariant }>`
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 5px;
  background: rgba(14, 159, 110, 0.08);
  border-radius: 4px;
  border: 1px solid
    ${({ variant }) => {
      switch (variant) {
        case IndicatorVariant.POSITIVE:
          return INDICATOR_COLOR_POSITIVE
        case IndicatorVariant.WARNING:
          return INDICATOR_COLOR_WARNING
        case IndicatorVariant.NEGATIVE:
          return INDICATOR_COLOR_NEGATIVE
        case IndicatorVariant.UNDEFINED:
          return INDICATOR_COLOR_UNDEFINED
      }
    }};
  box-shadow: 0px 0px 8px rgba(16, 158, 110, 0.15);
  margin-right: 4px;
`
