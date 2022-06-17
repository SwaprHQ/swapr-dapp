import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'

import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'

export const ValueWithLabel = ({
  title,
  value,
  big = false,
  center = false,
  labelDesktop = true,
}: {
  title: string
  value: string
  big?: boolean
  center?: boolean
  labelDesktop?: boolean
}) => {
  const isMobile = useIsMobileByMedia()

  return (
    <div>
      {(labelDesktop || isMobile) && (
        <Title mb="8px" fontSize="11px">
          {title}
        </Title>
      )}
      <Value big={big} textAlign={center ? 'center' : 'left'}>
        {value}
      </Value>
    </div>
  )
}

const Title = styled(Text)`
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
const Value = styled(Text)<{ big: boolean }>`
  color: ${({ theme, big }) => (big ? theme.white : theme.text4)};
  font-size: ${({ big }) => (big ? '18px' : '15px')};

  ${({ theme, big }) => theme.mediaWidth.upToSmall`
    font-size: ${big ? '14px' : '12px'}
  `};
`
