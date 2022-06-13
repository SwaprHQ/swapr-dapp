import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { TYPE } from '../../../../../../theme'
import DateTimeInput from '../../../../../Input/DateTimeInput'

const TimeSelectorWrapper = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    gap: 22px;
    justify-content: space-evenly;
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
    <TimeSelectorWrapper
      flexDirection="column"
      alignSelf={'stretch'}
      data-testid={`${title.toLowerCase()}-time-selector-box`}
    >
      <Flex>
        <TYPE.small textAlign={'start'} fontWeight="600" color="text2" letterSpacing="0.08em">
          {title}
        </TYPE.small>
      </Flex>
      <Flex maxWidth={'154px'}>
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
