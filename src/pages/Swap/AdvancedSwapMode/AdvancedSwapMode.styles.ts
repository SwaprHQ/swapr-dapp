import styled, { css } from 'styled-components'

export const BaseWrapper = styled.div`
  background: #101019;
  border-radius: 12px;
  padding: 10px;
`
export const AdvancedModeDetailsItems = css`
  & > div {
    flex-basis: 18%;
    line-height: 1.4;
  }
`

export const AdvancedSwapModeContainer = styled.div`
  backdrop-filter: blur(10px);
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 0 20px;
`

export const ChartWrapper = styled(BaseWrapper)`
  grid-column: 1 / 3;
  overflow: hidden;
  min-height: 560px;
  padding: 0;
`

export const OrdersWrapper = styled(BaseWrapper)`
  grid-column: 1 / 4;
  height: 280px;
`

export const LiquidityWrapper = styled(BaseWrapper)`
  grid-column: 4 / 5;
`

export const LoaderContainer = styled.div`
  text-align: center;
  width: 100%;
  margin: 20px 0;
`

export const SwapBox = styled.div`
  padding: 1rem 0.5rem 0;
  height: 100%;

  > div {
    margin-left: auto;
    margin-right: auto;
  }
`

export const AdvancedModeHeader = styled.div`
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

  ${AdvancedModeDetailsItems};

  & div {
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
export const TransactionsWrapper = styled.div<{ maxHeight?: string }>`
  overflow-y: scroll;
  max-height: ${({ maxHeight }) => (maxHeight ? maxHeight : '400px')};

  &&::-webkit-scrollbar {
    display: none;
  }
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
