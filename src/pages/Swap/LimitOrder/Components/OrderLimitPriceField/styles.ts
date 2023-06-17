import { Flex } from 'rebass'
import styled from 'styled-components'

import { InputGroup } from '../InputGroup'

export const LimitLabel = styled(InputGroup.Label)`
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
