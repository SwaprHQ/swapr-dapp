import { Flex } from 'rebass/styled-components'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'

export const GridCard = styled(Flex)`
  row-gap: 24px;
`

export const FarmingBadge = styled.div<{ isGreyed?: boolean }>`
  height: 16px;
  border: solid 1px;
  border-color: ${({ isGreyed, theme }) => (isGreyed ? `transparent` : `${theme.green2}`)};
  div {
    color: ${({ isGreyed, theme }) => (isGreyed ? theme.purple2 : theme.green2)};
  }
  border-radius: 6px;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 2px;
  background-color: ${({ isGreyed, theme }) => isGreyed && theme.bg3};
  opacity: ${({ isGreyed }) => isGreyed && '0.5'};
  gap: 4px;
  svg {
    > path {
      fill: ${({ isGreyed, theme }) => (isGreyed ? theme.purple2 : theme.green2)};
    }
  }
  font-weight: 700;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.02em;
`

export const BadgeText = styled.div`
  font-weight: 700;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`

export const EllipsizedText = styled(TYPE.body)`
  overflow: hidden;
  text-overflow: ellipsis;
`
