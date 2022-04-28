import styled from 'styled-components'
import { transparentize } from 'polished'

export const AdvancedDetailsFooter = styled.div<{
  clickable?: boolean
  fullWidth?: boolean
  padding: string
  height?: string
}>`
  width: ${props => (props.fullWidth ? '457px' : 'auto')};
  ${props => props.theme.mediaWidth.upToExtraSmall`
    width: calc(100% - 8px);
    `}
  max-width: 457px;
  min-width: 100%;
  height: ${props => (props.height ? props.height : 'auto')};
  padding: ${props => props.padding};
  color: ${({ theme }) => theme.purple3};
  background-color: ${props => transparentize(0.45, props.theme.bg1)};
  border: solid 1px ${({ theme }) => theme.purple6};
  border-radius: 12px;
  backdrop-filter: blur(16px);
  cursor: ${props => (props.clickable ? 'pointer' : 'auto')};
  box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.1);
`
