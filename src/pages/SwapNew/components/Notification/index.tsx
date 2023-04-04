import { AlertTriangle } from 'react-feather'
import styled from 'styled-components'

import { BorderStyle, ELEMENTS_SPACING } from '../../constants'

export function Notification() {
  return (
    <Container>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={18} />
      </SwapCallbackErrorInnerAlertTriangle>
      <Text>This is a notification!</Text>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 22px;
  ${BorderStyle}
  background-color: rgba(240, 46, 81, 0.1);
  margin-top: ${ELEMENTS_SPACING};
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  color: red;
  background-color: rgba(240, 46, 81, 0.1);
  margin-right: 8px;
`

const Text = styled.p`
  line-height: 24px;
  font-size: 12px;
  color: #f02e51;
  text-transform: uppercase;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
`
