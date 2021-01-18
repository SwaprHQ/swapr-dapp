import styled from 'styled-components'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import Card from '../../../components/Card'
import { RowBetween } from '../../../components/Row'
import { TYPE } from '../../../theme'

export const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    
  `};
`

export const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

export const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
  margin-right: 8px;
`

export const InfoText = styled(TYPE.body)`
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
  color: ${({ theme }) => theme.purple2};
`

export const TextCard = styled(Card)`
  background: linear-gradient(113.18deg, #ffffff -0.1%, rgba(0, 0, 0, 0) 98.9%), #28263f;
  background-blend-mode: overlay, normal;
  border-radius: 4px;
  height: 15px;
  padding: 3px 5px;
  align-items: center;
  margin-top: 8px;
  width: auto;
`
