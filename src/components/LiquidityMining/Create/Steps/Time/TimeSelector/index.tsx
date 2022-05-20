import React from 'react'
import { TYPE } from '../../../../../../theme'
import { Flex } from 'rebass'
import DateTimeInput from '../../../../../Input/DateTimeInput'
import styled from 'styled-components'

const TimeSelectorWrapper = styled(Flex)`
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width:53%
  `};
`

interface TimeSelectorProps {
  title: string
  placeholder: string
  minimum?: Date
  value: Date | null
  onChange: (date: Date) => void
}

export default function TimeSelector({ title, placeholder, minimum, value, onChange }: TimeSelectorProps) {
  return (
    <TimeSelectorWrapper flexDirection="column" alignSelf={'stretch'} justifyContent="space-between">
      <Flex>
        <TYPE.small textAlign={'start'} fontWeight="600" color="text2" letterSpacing="0.08em">
          {title}
        </TYPE.small>
      </Flex>
      <Flex>
        <DateTimeInput
          value={value}
          placeholder={placeholder}
          minimum={minimum}
          maximum={new Date(Number.MAX_SAFE_INTEGER)}
          onChange={onChange}
        />
      </Flex>
    </TimeSelectorWrapper>
  )
}
