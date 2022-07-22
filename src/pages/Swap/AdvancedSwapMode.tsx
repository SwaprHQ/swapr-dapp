import React, { FC, PropsWithChildren, useMemo } from 'react'
import { CryptoCurrencyMarket } from 'react-ts-tradingview-widgets'
import styled from 'styled-components'
import { breakpoints } from 'utils/theme'

const Box = styled.section`
  display: flex;
  flex: 1;
  width: 100%;
  margin-bottom: 2rem;
  background: rgba(25, 24, 36, 0.7);
  border-radius: 12px;
  @media screen and (max-width: ${breakpoints.l}) {
    flex-wrap: wrap;
  }
`

const BorderBox = styled.div`
  border: 1px solid rgba(41, 38, 67, 1);
`

//  TODO: better calculate height
const DiagramBox = styled(BorderBox)`
  flex: 1;
  height: calc(100vh - 162px);
  border: 1px solid rgba(41, 38, 67, 1);
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
    flex-wrap: wrap;
  }
`

const InfoBox = styled.div`
  display: flex;
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
  }
  @media screen and (max-width: ${breakpoints.md}) {
    flex-wrap: wrap;
  }
`

const HistoryBox = styled.div`
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

const HistoryTradeBox = styled(BorderBox)`
  height: 50%;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

const HistoryLiquidityBox = styled(BorderBox)`
  height: 50%;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

const TradesAndOrderBox = styled(BorderBox)`
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
const TradeBox = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`
const OrderBox = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

const TitleColumn = styled(BorderBox)`
  padding: 1rem 0.5rem;
`

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  //TODO: change it to AdvancedRealTimeChart
  const memoizedAdvancedRealTimeChart = useMemo(() => <CryptoCurrencyMarket colorTheme="dark" width="100%" />, [])

  return (
    <Box>
      <DiagramBox>
        <TitleColumn>Diagram</TitleColumn>
        {memoizedAdvancedRealTimeChart}
      </DiagramBox>
      <InfoBox>
        <HistoryBox>
          <HistoryTradeBox>
            <TitleColumn>Trade History</TitleColumn>
          </HistoryTradeBox>
          <HistoryLiquidityBox>
            <TitleColumn>Liquidity History</TitleColumn>
          </HistoryLiquidityBox>
        </HistoryBox>
        <TradesAndOrderBox>
          <TradeBox>
            <TitleColumn>Trade</TitleColumn>
            {children}
          </TradeBox>
          <OrderBox>
            <TitleColumn>Orders</TitleColumn>
          </OrderBox>
        </TradesAndOrderBox>
      </InfoBox>
    </Box>
  )
}
