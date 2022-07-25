import React, { FC, PropsWithChildren, useMemo } from 'react'
import { CryptoCurrencyMarket } from 'react-ts-tradingview-widgets'
import styled, { css } from 'styled-components'
import { breakpoints } from 'utils/theme'

const ContainerBox = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 2rem;
  background: rgba(25, 24, 36, 0.7);
  border-radius: 12px;
  @media screen and (max-width: ${breakpoints.l}) {
    display: block;
  }
`

const BorderStyling = css`
  border: 1px solid rgba(41, 38, 67, 1);
`

const AdvanceSwapModeHeight = css`
  height: calc(100vh - 162px);
`

const WidthBox = styled.div`
  z-index: 3;

  ${BorderStyling}
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`
const TitleColumn = styled.div`
  padding: 1rem 0.5rem;
  ${BorderStyling}
`

const BodyColumn = styled.div`
  padding: 0 0.5rem;
`

const DiagramContainerBox = styled.div`
  flex: 1;
  ${AdvanceSwapModeHeight}
  ${BorderStyling}
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
    flex-wrap: wrap;
  }
`

const InfoContainerBox = styled.div`
  display: flex;
  ${AdvanceSwapModeHeight}
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
    height: auto;
  }
  @media screen and (max-width: ${breakpoints.md}) {
    flex-wrap: wrap;
  }
`

const ColumnBoxStyles = css`
  @media screen and (max-width: ${breakpoints.md}) {
    width: 100%;
    display: flex;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    display: block;
  }
`

const HistoryColumnBox = styled.div`
  width: 40%;
  min-width: 350px;

  ${ColumnBoxStyles}
  @media screen and (max-width: ${breakpoints.md}) {
    order: 1;
  }
`

const HistoryBox = styled(WidthBox)`
  height: 50%;

  @media screen and (max-width: ${breakpoints.l}) {
    height: 400px;
  }
`

const HistoryBoxBody = styled(BodyColumn)`
  overflow-y: auto;
  max-height: calc(100% - 50px);
`

const TradesAndOrderColumnBox = styled.div`
  width: 60%;
  min-width: 400px;
  ${ColumnBoxStyles}
  @media screen and (max-width: ${breakpoints.md}) {
    order: 0;
  }
`

const TradeContent = styled.div`
  padding: 0 0.5rem;
  @media screen and (max-width: ${breakpoints.l}) {
    > div {
      width: 100%;
      max-width: none;
    }
  }
`

const RowBox = styled.div`
  display: flex;
  justify-content: space-between;
`

const oneRow = {
  transactionValue: 5,
  currency: '$',
  time: '11min',
  token0: {
    name: 'Token 0',
    currency: 'T0',
    value: 2,
  },
  token1: {
    name: 'Token 1',
    currency: 'T1',
    value: 1,
  },
}

const mockData = [
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
  oneRow,
]

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  //TODO: change it to AdvancedRealTimeChart
  const memoizedAdvancedRealTimeChart = useMemo(() => <CryptoCurrencyMarket colorTheme="dark" width="100%" />, [])

  return (
    <ContainerBox>
      <DiagramContainerBox>
        <TitleColumn>Diagram</TitleColumn>
        {memoizedAdvancedRealTimeChart}
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <HistoryBoxBody>
              {mockData.map((row, index) => {
                return (
                  <RowBox key={index}>
                    <div>
                      {row.currency} {row.transactionValue}
                    </div>
                    <div>
                      <div>
                        {row.token0.currency} {row.token0.value}
                      </div>
                      <div>
                        {row.token1.currency} {row.token1.value}
                      </div>
                    </div>
                    <div>{row.time}</div>
                  </RowBox>
                )
              })}
            </HistoryBoxBody>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <HistoryBoxBody>
              {mockData.map((row, index) => {
                return (
                  <RowBox key={index}>
                    <div>
                      {row.currency} {row.transactionValue}
                    </div>
                    <div>
                      <div>
                        {row.token0.currency} {row.token0.value}
                      </div>
                      <div>
                        {row.token1.currency} {row.token1.value}
                      </div>
                    </div>
                    <div>{row.time}</div>
                  </RowBox>
                )
              })}
            </HistoryBoxBody>
          </HistoryBox>
        </HistoryColumnBox>
        <TradesAndOrderColumnBox>
          <WidthBox>
            <TitleColumn>Trade</TitleColumn>
            <TradeContent>{children}</TradeContent>
          </WidthBox>
          <WidthBox>
            <TitleColumn>Orders</TitleColumn>
          </WidthBox>
        </TradesAndOrderColumnBox>
      </InfoContainerBox>
    </ContainerBox>
  )
}
