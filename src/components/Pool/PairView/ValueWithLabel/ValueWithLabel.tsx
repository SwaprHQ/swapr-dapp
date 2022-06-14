import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'

export const ValueWithLabel = ({
  title,
  value,
  big = false,
  center = false,
}: {
  title: string
  value: string
  big?: boolean
  center?: boolean
}) => (
  <div>
    <ValueWithLabelTitle mb="8px" fontSize="10px">
      {title}
    </ValueWithLabelTitle>
    <ValueWithLabelValue fontSize={big ? '18px' : '14px'} big={big} textAlign={center ? 'center' : 'left'}>
      {value}
    </ValueWithLabelValue>
  </div>
)

const ValueWithLabelTitle = styled(Text)`
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
const ValueWithLabelValue = styled(Text)<{ big: boolean }>`
  color: ${({ theme, big }) => (big ? theme.white : theme.text4)};
`
