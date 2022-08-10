import styled, { css } from 'styled-components'

import { breakpoints } from '../../../utils/theme'

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

export const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  width: 100%;
  ${AdvanceSwapModeHeight}
  display: grid;
  grid-template-columns: 50% 20% 30%;
  grid-template-rows: 60% 40%;

  .d-1 {
    ${BorderStyling}
  }

  .d-4 {
    grid-column: 1 /2;
  }
  .d-5 {
    grid-column: 2 /4;
  }

  .d-2 {
    border-top: 1px solid rgba(41, 38, 67, 1);
    border-left: 0;
  }
  .d-3 {
    border-top: 1px solid rgba(41, 38, 67, 1);
    border-bottom: 1px solid rgba(41, 38, 67, 1);
    border-left: 1px solid rgba(41, 38, 67, 1);
  }

  .d-4,
  .d-5 {
    border: 1px solid rgba(41, 38, 67, 1);
  }

  @media screen and (max-width: ${breakpoints.l}) {
    height: auto;
    grid-template-rows: auto;
    .d-1 {
      grid-column: 1 /-1;
      height: 400px;
    }
    .d-2,
    .d-3 {
      max-height: 450px;
    }
    d-1,
    .d-4,
    .d-5 {
      height: 400px;
    }
    .d-1 {
      order: 0;
    }

    .d-2 {
      order: 2;
      grid-column: 3 /4;
    }

    .d-3 {
      order: 1;
      grid-column: 1 /3;
    }
    .d-4 {
      order: 4;
    }
    .d-5 {
      order: 5;
    }
    .d-2 {
      border-left: 1px solid rgba(41, 38, 67, 1);
    }
  }
  @media screen and (min-width: ${breakpoints.s}) && (max-width: ${breakpoints.l}) {
    .d-2 {
      grid-row: 2 /3;
    }

    .d-3 {
      grid-row: 2 /3;
    }
  }
  @media screen and (max-width: ${breakpoints.md}) {
    height: auto;
    grid-template-columns: 50% 10% 40%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    height: auto;
    grid-template-columns: 100%;

    .d-1,
    .d-2,
    .d-3,
    .d-4,
    .d-5 {
      grid-column: auto;
    }

    .d-1,
    .d-2,
    .d-3,
    .d-4,
    .d-5 {
      border-left: 0;
      border-right: 0;
    }
  }
`

export const TitleColumn = styled.div`
  padding: 1rem 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.purple6};
  font-weight: 600;
  color: ${({ theme }) => theme.purple2};
`

export const Table = styled.div`
  overflow-y: auto;
  height: calc(100% - 79px);
  position: relative;
  ${CustomScrollBar}
`

export const TableHeader = styled.div`
  padding: 0.5rem;
  display: flex;
  font-size: 13px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.purple6};
  font-weight: 600;

  color: ${({ theme }) => theme.purple3};
  & > div {
    width: calc(100% / 3);
  }
`
export const TablePoolHeader = styled.div`
  padding: 0.5rem;
  display: flex;
  font-size: 13px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.purple6};
  font-weight: 600;

  color: ${({ theme }) => theme.purple3};
  & > div {
    width: calc(100% / 3);
  }
`

export const EmptyCellBody = styled.div`
  padding: 2rem 1rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.4;
`

export const LoaderContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  margin-top: 20px;
`

export const TradeContent = styled.div`
  padding: 1rem 0.5rem 0;
  ${CustomScrollBar}
  overflow-y: auto;
  height: 100%;

  > div {
    margin-left: auto;
    margin-right: auto;
  }
`
