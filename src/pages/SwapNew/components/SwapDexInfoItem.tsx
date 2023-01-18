import styled from 'styled-components'

import { ReactComponent as SushiSVG } from '../../../assets/swapbox/dex-logo-sushi.svg'
import { TEXT_COLOR_PRIMARY } from '../constants'
import { BorderStyle, FontFamily } from './styles'

export function SwapDexInfoItem() {
  return (
    <Container>
      <DexInfo>
        <SushiSVG />
        <TextLabel>Sushi</TextLabel>
      </DexInfo>
      <TransactionCost>3989 USDT</TransactionCost>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  ${BorderStyle}
  background: linear-gradient(180deg, rgba(68, 65, 99, 0.1) -16.91%, rgba(68, 65, 99, 0) 116.18%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.2) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621;
  background-blend-mode: normal, overlay, normal;
  opacity: 0.8;
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  margin-bottom: 8px;
`

const DexInfo = styled.div`
  display: flex;
  align-items: center;
`

const TextLabel = styled.p`
  display: inline-block;
  line-height: 15px;
  font-size: 14px;
  ${FontFamily}
  font-weight: 600;
  font-feature-settings: 'zero' on;
  color: ${TEXT_COLOR_PRIMARY};
  margin-left: 8px;
`

const TransactionCost = styled.p`
  height: 28px;
  line-height: 20px;
  display: inline-block;
  padding: 4px;
  font-size: 14px;
  ${FontFamily}
  background: rgba(104, 110, 148, 0.1);
  border-radius: 4px;
`
