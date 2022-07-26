import styled, { css } from 'styled-components'
import { breakpoints } from 'utils/theme'

export const ContainerBox = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 2rem;
  background: #0c0b12;
  border-radius: 12px;
  @media screen and (max-width: ${breakpoints.l}) {
    display: block;
  }
`

export const ChartContainer = styled.div`
  height: calc(100% - 50px);
`

export const BorderStyling = css`
  border: 1px solid rgba(41, 38, 67, 1);
`

export const AdvanceSwapModeHeight = css`
  height: calc(100vh - 130px);
`

export const CustomScrollBar = css`
  &&::-webkit-scrollbar {
    width: 10px;
  }

  &&::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.bg3};
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.bg2};
  }
  //firefox support
  scrollbar-color: ${({ theme }) => theme.bg3 + ' ' + theme.bg2};
  scrollbar-width: thin;
`

export const WidthBox = styled.div`
  z-index: 3;
  ${BorderStyling}
  flex: 1;
  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

export const TitleColumn = styled.div`
  padding: 1rem 0.5rem;
  ${BorderStyling}
`

export const BodyColumn = styled.div`
  padding: 0 0.5rem;
`

export const DiagramContainerBox = styled.div`
  flex: 1;
  ${AdvanceSwapModeHeight}
  ${BorderStyling}
  @media screen and (max-width: ${breakpoints.l}) {
    width: 100%;
    flex-wrap: wrap;
  }
`

export const InfoContainerBox = styled.div`
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

export const ColumnBoxStyles = css`
  @media screen and (max-width: ${breakpoints.md}) {
    width: 100%;
    display: flex;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    display: block;
  }
`

export const HistoryColumnBox = styled.div`
  width: 40%;
  min-width: 350px;
  ${ColumnBoxStyles}
  @media screen and (max-width: ${breakpoints.md}) {
    order: 1;
  }
`

export const HistoryBox = styled(WidthBox)`
  height: 50%;
  @media screen and (max-width: ${breakpoints.l}) {
    height: 400px;
  }
`

export const HistoryBoxBody = styled.div`
  overflow-y: auto;
  max-height: calc(100% - 88px);
  ${CustomScrollBar}
`

export const TradesAndOrderColumnBox = styled.div`
  width: 60%;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  ${ColumnBoxStyles}
  @media screen and (max-width: ${breakpoints.md}) {
    order: 0;
    flex-direction: row;
  }
`

export const TradeContent = styled.div`
  padding: 0 0.5rem;
  @media screen and (max-width: ${breakpoints.l}) {
    > div {
      margin: auto;
    }
  }
`

export const ListTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #191919;
`
export const ListTitleElement = styled.div`
  text-align: center;
  width: calc(100% / 3);
  padding: 0 0.5rem;
`

export const HistoryTrade = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid #191919;
  }
  padding: 0.5rem;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
  align-items: center;
`

export const HistoryTradeCell = styled.div`
  width: calc(100% / 3);
  text-align: center;
`
