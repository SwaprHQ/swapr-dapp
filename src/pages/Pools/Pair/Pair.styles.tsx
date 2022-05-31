import styled from 'styled-components'
import { Flex } from 'rebass'
import { RowBetween, RowFixed } from '../../../components/Row'

export const TitleRow = styled(RowBetween)`
  margin-bottom: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

export const PointableFlex = styled(Flex)`
  border: solid 1px ${props => props.theme.bg3};
  border-radius: 8px;
  height: 36px;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
`

export const ButtonRow = styled(RowFixed)`
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 8px;
  `};
`

export const TwoColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.4fr;
  grid-gap: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 24px;
`
