import styled from 'styled-components'

import { ReactComponent as SushiSVG } from '../../../assets/swapbox/dex-logo-sushi.svg'
import { TEXT_COLOR_PRIMARY } from '../constants'
import { BorderStyle, FontFamily } from './styles'

type SwapDexInfoItemProps = {
  isSelected?: boolean
}

export function SwapDexInfoItem({ isSelected = false }: SwapDexInfoItemProps) {
  return (
    <Container isSelected={isSelected}>
      <DexInfo isSelected={isSelected}>
        <Dex>
          <SushiSVG />
          <TextLabel>Sushi</TextLabel>
        </Dex>
        {isSelected && <BestRouteLabel>Best Route Selected</BestRouteLabel>}
      </DexInfo>
      <TransactionInfo isSelected={isSelected}>
        <TransactionCost>3989 USDT</TransactionCost>
      </TransactionInfo>
    </Container>
  )
}

const Container = styled.div<{ isSelected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${({ isSelected }) =>
    isSelected &&
    `
    flex-direction: column;
    gap: 18px;  
  `}
  padding: 14px;
  ${BorderStyle}
  background: linear-gradient(180deg, rgba(68, 65, 99, 0.1) -16.91%, rgba(68, 65, 99, 0) 116.18%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.2) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621;
  background-blend-mode: normal, overlay, normal;
  opacity: 0.8;
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  margin-bottom: 8px;
  cursor: pointer;
`

const DexInfo = styled.div<{ isSelected: boolean }>`
  height: 20px;
  display: flex;
  align-items: center;
  ${({ isSelected }) =>
    isSelected &&
    `
    width: 100%;
    justify-content: space-between;
  `}
`

const Dex = styled.div`
  display: flex;
  align-items: center;
`

const BestRouteLabel = styled.p`
  height: 17px;
  display: inline-block;
  padding: 3px 5px;
  font-size: 9px;
  ${FontFamily}
  font-weight: 600;
  line-height: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0e9f6e;
  background: rgba(14, 159, 110, 0.15);
  border-radius: 4px;
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

const TransactionInfo = styled.div<{ isSelected: boolean }>`
  ${({ isSelected }) =>
    isSelected &&
    `
    width: 100%;
  `}
  height: 20px; ;
`

const TransactionCost = styled.p`
  height: 20px;
  line-height: 12px;
  display: inline-block;
  padding: 4px;
  font-size: 14px;
  ${FontFamily}
  background: rgba(104, 110, 148, 0.1);
  border-radius: 4px;
`
