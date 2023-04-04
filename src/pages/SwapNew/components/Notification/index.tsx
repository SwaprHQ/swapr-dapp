import styled from 'styled-components'

import { BorderStyle, ELEMENTS_SPACING } from '../../constants'

export function Notification() {
  return (
    <Container>
      <Text>This is a notification!</Text>
    </Container>
  )
}

const Container = styled.div`
  padding: 8px 22px;
  ${BorderStyle}
  background-color: rgba(240, 46, 81, 0.1);
  margin-top: ${ELEMENTS_SPACING};
`

const Text = styled.p`
  line-height: 24px;
  font-size: 12px;
  color: #f02e51;
  text-transform: uppercase;
`
