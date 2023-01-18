import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../../assets/swapbox/dexes.svg'
import { ReactComponent as GasSVG } from '../../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../../assets/swapbox/shield.svg'

type IndicatorProps = {
  variant: 'positive' | 'warning' | 'negative' | 'undefined'
  icon: 'dexes' | 'gas' | 'banana' | 'shield'
}

export function Indicator({ icon }: IndicatorProps) {
  return (
    <Container>
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

const Container = styled.div`
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 5px;
  background: rgba(14, 159, 110, 0.08);
  border-radius: 4px;
  border: 1px solid rgba(14, 159, 110, 0.65);
  box-shadow: 0px 0px 8px rgba(16, 158, 110, 0.15);
  margin-right: 4px;
`
