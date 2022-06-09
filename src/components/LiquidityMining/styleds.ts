import { Card as DefaultCard } from 'rebass'
import styled from 'styled-components'

import { DarkCard } from '../Card'

export const Card = styled(DarkCard)`
  width: 100%;
`
export const SmoothGradientCard = styled(DefaultCard)<{
  selectable?: boolean
  active?: boolean
  width?: string
  height?: string
  isToken?: boolean
  justifyContent?: string
  alignItems?: string
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}>`
  position: relative;
  display: flex;
  justify-content: ${props => (props.justifyContent ? props.justifyContent : 'end')};
  align-items: ${props => (props.alignItems ? props.alignItems : 'center')};
  color: ${props => (props.active ? props.theme.text3 : props.theme.text5)};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
  text-align: center;
  cursor: ${props => props.selectable && 'pointer'};
  border: 1.5px solid ${props => (props.active ? '#3A1D75' : '#464366')};
  opacity: ${({ disabled }) => (disabled ? '0.3' : '1')};
  border-radius: 12px;

  background: ${props =>
    props.isToken && props.active
      ? ' linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),linear-gradient(180deg, rgba(90, 12, 255, 0.8) -16.28%, rgba(17, 8, 35, 0) 100%)'
      : props.active
      ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(114.19deg, rgba(90, 12, 255, 0.9) -50%, rgba(17, 8, 35, 0) 80.1%);'
      : 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(114.19deg, rgba(90, 12, 255, 0.1) -9%, rgba(17, 8, 35, 0) 113.1%)'};
`

export const Divider = styled.div`
  height: 100%;
  width: 1px;
  background: ${props => props.theme.bg5};
`
export const HorizontalDivider = styled.div`
  position: relative;
  top: 17px;
  height: 1px;
  width: 37.5px;
  margin: 0 18px;
  background: ${props => props.theme.bg5};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display:none;
  `};
`
