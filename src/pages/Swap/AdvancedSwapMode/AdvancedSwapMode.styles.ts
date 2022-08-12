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
  backdrop-filter: blur(10px);
  width: 100%;
  min-height: 130vh;
  display: grid;
  grid-template-columns: 50% 20% 30%;
  grid-template-rows: auto 40%;

  @media screen and (max-width: ${breakpoints.l}) {
    grid-template-rows: auto;
  }

  @media screen and (max-width: ${breakpoints.md}) {
    height: auto;
    grid-template-columns: 50% 10% 40%;
  }

  @media screen and (max-width: ${breakpoints.s}) {
    height: auto;
    grid-template-columns: 1fr;

    & > div {
      border-left: none;
      border-right: none;
      grid-column: 1 / -1;
    }
  }
`

export const ChartWrapper = styled.div`
  ${BorderStyling}
  @media screen and (max-width: ${breakpoints.l}) {
    grid-column: 1 / -1;
    order: 0;
    height: 500px;
  }

  @media screen and (max-width: ${breakpoints.s}) {
    order: 2;
  }
`

export const TradesWrapper = styled.div`
  border-top: 1px solid rgba(41, 38, 67, 1);
  border-left: none;

  @media screen and (max-width: ${breakpoints.l}) {
    order: 2;
    grid-column: 3 /4;
    border-left: 1px solid rgba(41, 38, 67, 1);
  }
  @media screen and (min-width: ${breakpoints.s}) and (max-width: ${breakpoints.l}) {
    grid-row: 2 / 3;
  }
`

export const SwapBoxWrapper = styled.div`
  border-top: 1px solid rgba(41, 38, 67, 1);
  border-bottom: 1px solid rgba(41, 38, 67, 1);
  border-left: 1px solid rgba(41, 38, 67, 1);

  @media screen and (max-width: ${breakpoints.l}) {
    order: 1;
    grid-column: 1 /3;
  }
  @media screen and (min-width: ${breakpoints.s}) and (max-width: ${breakpoints.l}) {
    grid-row: 2 / 3;
  }
`

export const OrdersWrapper = styled.div`
  grid-column: 1 / 2;
  border: 1px solid rgba(41, 38, 67, 1);

  @media screen and (max-width: ${breakpoints.l}) {
    order: 4;
  }
`

export const LiquidityWrapper = styled.div`
  grid-column: 2 / 4;
  border: 1px solid rgba(41, 38, 67, 1);

  @media screen and (max-width: ${breakpoints.l}) {
    order: 5;
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
  text-align: center;
`

export const SwapBox = styled.div`
  padding: 1rem 0.5rem 0;
  ${CustomScrollBar}
  height: 100%;

  > div {
    margin-left: auto;
    margin-right: auto;
  }
`

export const AdvancedModeHeader = styled.div`
  padding: 15px;
  margin-top: 10px;
`

export const AdvancedModeTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text4};
  text-transform: uppercase;
`

export const AdvancedModeDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 20px;
  color: ${({ theme }) => theme.purple3};
`
export const TransactionsWrapper = styled.div`
  ${CustomScrollBar}
  overflow-y: scroll;
  max-height: 600px;
`
export const SwitcherWrapper = styled.div`
  background: ${({ theme }) => theme.dark1};
  display: flex;
  align-items: center;
  border-radius: 20px;
  position: relative;
`
export const SwitchButton = styled.div<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.white : theme.text5)};
  background: ${({ theme, active }) => (active ? theme.dark2 : theme.dark1)};
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.1s ease;
  cursor: pointer;
  text-align: center;
`
