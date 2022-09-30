import styled, { css } from 'styled-components'

export const BaseWrapper = styled.div`
  background: ${({ theme }) => theme.bg9};
  border-radius: 12px;
  padding: 10px;
`
export const AdvancedModeDetailsItems = css`
  & > div:nth-child(1),
  & > div:nth-child(2) {
    flex-basis: 25%;
  }
  & > div:nth-child(3) {
    flex-basis: 20%;
  }
  & > div:nth-child(4) {
    flex-basis: 10%;
  }
  & > div {
    line-height: 1.4;
  }
`

const TitleBase = css`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text4};
  text-transform: uppercase;
`

export const AdvancedSwapModeWrapper = styled.div`
  backdrop-filter: blur(10px);
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 0.9fr)) minmax(0, 1.1fr);
  gap: 15px;
  padding: 0 20px;
`
export const PairDetailsWrapper = styled(BaseWrapper)`
  grid-column: 1 / -1;
  padding: 15px 20px;
`
export const PairSymbols = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: 700;
  font-size: 16px;
  margin: 0 5px;
`

export const PairInfo = styled.div`
  width: 10%;
  margin-left: 20px;
  overflow: hidden;
  &:nth-child(2) {
    min-width: 16%;
  }

  & > div:nth-child(2) {
    margin-top: 10px;
  }
`

export const PairTab = styled.div<{ size?: string }>`
  color: ${({ theme }) => theme.purple3};
  font-size: ${({ size }) => (size ? size : '11px')};
  font-weight: 500;
  letter-spacing: 0.08em;
`

export const PairValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text3};
`

export const PairValueChange = styled(PairValue)<{ positive: boolean; size?: string; space?: boolean }>`
  color: ${({ theme, positive }) => (positive ? theme.green2 : theme.red1)};
  font-size: ${({ size }) => (size ? size : '14px')};
`

export const ChartWrapper = styled(BaseWrapper)`
  grid-column: 1 / 3;
  overflow: hidden;
  min-height: 560px;
  padding: 0;
`

export const OrdersWrapper = styled(BaseWrapper)`
  grid-column: 1 / 4;
  height: 380px;
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

export const OrderButton = styled.button<{ isActive?: boolean }>`
  background: none;
  border: none;
  ${TitleBase}
  font-weight: ${({ isActive }) => (isActive ? 600 : 400)};
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
  }
`

export const AdvancedModeHeader = styled.div`
  margin-top: 10px;
`

export const AdvancedModeTitle = styled.div`
  ${TitleBase}
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
export const SwitchButton = styled.button<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.white : theme.text5)};
  background: ${({ theme, active }) => (active ? theme.dark2 : theme.dark1)};
  font-size: 12px;
  border-radius: 20px;
  transition: background 0.3s ease;
  cursor: pointer;
  text-align: center;
  width: 50px;
  height: 25px;
  border: none;
`

export const NoDataMessage = styled.p`
  color: ${({ theme }) => theme.purple2};
  text-align: center;
  margin-top: 30px;
  font-size: 14px;

  & > span {
    font-weight: 700;
  }
`
