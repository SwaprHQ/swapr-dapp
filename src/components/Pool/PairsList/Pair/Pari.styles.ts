import styled from 'styled-components'
import { Flex } from 'rebass'
import { TYPE } from '../../../../theme'

export const GridCard = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  border-top: 1px solid ${props => props.theme.bg3};
  padding: 22px;
`

export const FarmingBadge = styled.div<{ isGreyed?: boolean }>`
  height: 16px;
  border: solid 1px;
  border-color: ${props => (props.isGreyed ? `transparent` : `${props.theme.green2}`)};
  div {
    color: ${props => (props.isGreyed ? props.theme.purple2 : props.theme.green2)};
  }
  border-radius: 6px;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 2px;
  background-color: ${props => props.isGreyed && props.theme.bg3};
  opacity: ${props => props.isGreyed && '0.5'};
  gap: 4px;
  svg {
    > path {
      fill: ${props => (props.isGreyed ? props.theme.purple2 : props.theme.green2)};
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
export const ValueText = styled.div`
  color: ${props => props.theme.purple2};
  font-size: 14px;
  font-weight: 500;
  line-height: 16.8px;
  font-family: 'Fira Code';
`
export const ItemsWrapper = styled(Flex)`
  justify-content: space-evenly;
  flex-direction: column;
`
