import styled, { css } from 'styled-components'
import { breakpoints } from 'utils/theme'

export const ContainerBox = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 2rem;
  background: #0c0b12;
  border-radius: 12px;
  color: #b2b5be;
  @media screen and (max-width: ${breakpoints.l}) {
    display: block;
  }
`
export const BorderStyling = css`
  border: 1px solid ${({ theme }) => theme.purple6};
`

export const AdvanceSwapModeHeight = css`
  height: calc(100vh - 130px);

  @media screen and (max-width: ${breakpoints.md}) {
    height: calc(100vh - 188px);
  }
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

export const ColumnCellBox = styled.div`
  z-index: 3;
  flex: 1;

  border: 1px solid rgba(41, 38, 67, 1);
  border-top: 0;

  @media screen and (max-width: ${breakpoints.md}) {
    width: 50%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    width: 100%;
  }
`

export const TitleColumn = styled.div`
  padding: 1rem 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.purple6};
  font-weight: 600;
  color: ${({ theme }) => theme.purple4};
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
  flex: 0;
  ${AdvanceSwapModeHeight}
  border-top: 1px solid rgb(41, 38, 67);
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

export const HistoryBox = styled(ColumnCellBox)`
  height: 50%;

  @media screen and (max-width: ${breakpoints.l}) {
    height: 400px;
  }
`

export const ListBox = styled.div`
  overflow-y: auto;
  height: calc(100% - 88px);
  position: relative;
  ${CustomScrollBar}
`

export const EmptyCellBody = styled.div`
  padding: 2rem 1rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
`

export const LoaderContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  margin-top: 20px;
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
  padding: 1rem 0.5rem 0;

  @media screen and (max-width: ${breakpoints.l}) {
    > div {
      margin-left: auto;
      margin-right: auto;
    }
  }
`
