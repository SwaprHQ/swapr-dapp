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
    <Title mb="8px" fontSize="10px">
      {title}
    </Title>
    <Value big={big} textAlign={center ? 'center' : 'left'}>
      {value}
    </Value>
  </div>
)

const Title = styled(Text)`
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
const Value = styled(Text)<{ big: boolean }>`
  color: ${({ theme, big }) => (big ? theme.white : theme.text4)};
  font-size: ${({ big }) => (big ? '18px' : '16px')};

  ${({ theme, big }) => theme.mediaWidth.upToSmall`
    font-size: ${big ? '14px' : '12px'}
  `};
`
