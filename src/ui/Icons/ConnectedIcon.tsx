import styled from 'styled-components'

import { ReactComponent as ConnectedSvg } from '../../assets/images/connected.svg'

export const ConnectedIcon = styled(ConnectedSvg)<{ width?: string; padding?: string; margin?: string }>`
  min-width: ${props => (props.width ? props.width : '22px')};
  padding: ${props => (props.padding ? props.padding : '0')};
  margin: ${props => (props.margin ? props.margin : '0')};
`
