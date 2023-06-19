import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as ProgressCircle } from '../../../../../assets/images/progress-circle.svg'

export const LimitLabel = styled.label`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8c83c0;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const SetToMarket = styled.button`
  font-size: 10px;
  color: #8c83c0;
  border: none;
  cursor: pointer;
  background-color: #2a2f41;
  border-radius: 5px;
  text-transform: uppercase;
  padding: 3px 8px;
  &:hover {
    color: #736f96;
  }
`

export const MarketPrice = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  color: ${({ theme }) => theme.green2};
  border: 1px solid ${({ theme }) => theme.green2};
  cursor: pointer;
  background-color: transparent;
  border-radius: 5px;
  text-transform: uppercase;
  padding: 3px 8px;
  &:hover {
    border: 1px solid ${({ theme }) => theme.green2};
    color: ${({ theme }) => theme.green1};
  }
`

export const SwapTokenIconWrapper = styled.div`
  margin-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  width: 24px;
  height: 22px;
  background: rgba(104, 110, 148, 0.3);
  border-radius: 4.25926px;
  color: #bcb3f0;
`

export const SwapTokenWrapper = styled(Flex)`
  color: #8780bf;
  align-items: center;
  &:hover {
    color: #736f96;
    & > div {
      color: #736f96;
    }
  }
`
export const ToggleCurrencyButton = styled.span`
  color: #464366;
  cursor: pointer;
`

export const MarketPriceDiff = styled.span<{ isPositive: boolean }>`
  color: ${({ isPositive, theme }) => (isPositive ? theme.green2 : theme.red1)};
`

export const StyledProgressCircle = styled(ProgressCircle)`
  width: 12px;
  height: 12px;
  margin-left: 4px;
  transform: rotate(-90deg);

  .move {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: dash 15s 0s infinite linear forwards;

    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }
  }
`
