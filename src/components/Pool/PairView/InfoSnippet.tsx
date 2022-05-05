import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'

export const InfoSnippet = ({
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
    <InfoSnippetTitle mb="8px" fontSize="10px">
      {title}
    </InfoSnippetTitle>
    <InfoSnippetValue fontSize={big ? '18px' : '14px'} big={big} textAlign={center ? 'center' : 'left'}>
      {value}
    </InfoSnippetValue>
  </div>
)

const InfoSnippetTitle = styled(Text)`
  color: ${({ theme }) => theme.text5};
  text-transform: uppercase;
`
const InfoSnippetValue = styled(Text)<{ big: boolean }>`
  color: ${({ theme, big }) => (big ? theme.white : theme.text4)};
`
