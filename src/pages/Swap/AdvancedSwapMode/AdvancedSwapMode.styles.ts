import styled from 'styled-components'
import { breakpoints } from 'utils/theme'

export const Box = styled.section`
  display: flex;
  flex: 1;
  width: 100%;
  margin-bottom: 2rem;
  background: #0c0b12;
  border-radius: 12px;
  @media screen and (max-width: ${breakpoints.l}) {
    flex-wrap: wrap;
  }
`

export const BorderBox = styled.div`
  border: 1px solid rgba(41, 38, 67, 1);
`

//  TODO: better calculate height
export const DiagramBox = styled(BorderBox)`
  flex: 1;
  height: calc(100vh - 162px);
  border: 1px solid rgba(41, 38, 67, 1);
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
    flex-wrap: wrap;
  }
`

export const InfoBox = styled.div`
  display: flex;
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
  }
  @media screen and (max-width: ${breakpoints.md}) {
    flex-wrap: wrap;
  }
`

export const HistoryBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  @media screen and (max-width: ${breakpoints.l}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.md}) {
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
  }
`

export const HistoryTradeBox = styled(BorderBox)`
  height: 50%;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

export const HistoryLiquidityBox = styled(BorderBox)`
  height: 50%;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

export const TradesAndOrderBox = styled(BorderBox)`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: ${breakpoints.l}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.md}) {
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
  }
`
export const TradeBox = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`
export const OrderBox = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

export const TitleColumn = styled(BorderBox)`
  padding: 1rem 0.5rem;
`

export const HistoryTrade = styled.div`
  margin: 10px;
  border: 1px solid #191919;
  padding: 5px;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
  align-items: center;
`
