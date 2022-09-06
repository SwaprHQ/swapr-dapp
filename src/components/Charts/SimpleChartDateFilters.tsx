import { Flex } from 'rebass'
import styled from 'styled-components'

import { DATE_INTERVALS } from '../../hooks/usePairTokenPriceByTimestamp'

export const SimpleChartDateFilters = ({
  selectedInterval,
  setInterval,
}: {
  selectedInterval: string
  setInterval: Function
}) => (
  <Flex>
    <DateFilterButton active={selectedInterval === DATE_INTERVALS.DAY} onClick={() => setInterval(DATE_INTERVALS.DAY)}>
      1d
    </DateFilterButton>
    <DateFilterButton
      active={selectedInterval === DATE_INTERVALS.WEEK}
      onClick={() => setInterval(DATE_INTERVALS.WEEK)}
    >
      1w
    </DateFilterButton>
    <DateFilterButton
      active={selectedInterval === DATE_INTERVALS.MONTH}
      onClick={() => setInterval(DATE_INTERVALS.MONTH)}
    >
      1m
    </DateFilterButton>
    <DateFilterButton
      active={selectedInterval === DATE_INTERVALS.YEAR}
      onClick={() => setInterval(DATE_INTERVALS.YEAR)}
    >
      1y
    </DateFilterButton>
  </Flex>
)

const DateFilterButton = styled.button<{ active?: boolean }>`
  margin-left: 4px;
  padding: 8px 10px;
  height: fit-content;
  border: none;

  color: ${({ theme, active }) => (active ? theme.white : theme.text4)};
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  background: transparent;

  cursor: pointer;

  &:hover {
    color: white;
  }
`
