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
  height: calc(100vh - 162px);
`

export const WidthBox = styled.div`
  z-index: 3;
  ${BorderStyling}
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

export const HistoryBoxBody = styled(BodyColumn)`
  overflow-y: auto;
  max-height: calc(100% - 50px);
`

export const TradesAndOrderColumnBox = styled.div`
  width: 60%;
  min-width: 400px;
  ${ColumnBoxStyles}
  @media screen and (max-width: ${breakpoints.md}) {
    order: 0;
  }
`

export const TradeContent = styled.div`
  padding: 0 0.5rem;
  @media screen and (max-width: ${breakpoints.l}) {
    > div {
      width: 100%;
      max-width: none;
    }
  }
`

export const RowBox = styled.div`
  display: flex;
  justify-content: space-between;
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
