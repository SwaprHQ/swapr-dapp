import React from 'react'
import Datepicker from 'react-datepicker'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as CalendarIcon } from '../../../assets/svg/calendar.svg'
import { StyledInput } from '../styleds'

const Input = styled(StyledInput)<{ selected: boolean }>`
  position: relative;
  border: ${({ selected, theme }) => (!selected ? '2px solid #6322E4' : `1px solid ${theme.purple5}`)};
  border-radius: 8px;
  min-width: 154px;
  font-size: 11px;
  font-weight: 600;
  line-height: 11px;
  letter-spacing: 0.08em;
  height: 30px;
  padding-left: 12px;
  padding-right: 12px;
  color: ${({ theme, selected }) => (!selected ? theme.text2 : theme.dark4)};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  line-height: 11px;
`

const StyledDay = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text2};
`
const StyledDatePicker = styled(Datepicker)`
  ::placeholder {
    color: ${({ theme }) => theme.text2};
  }
`
const StyledCalendarIcon = styled(CalendarIcon)<{ selected: boolean }>`
  position: absolute;
  top: 7px;
  right: 8px;
  pointer-events: all;
  path {
    fill: ${({ theme, selected }) => (!selected ? theme.text2 : theme.dark4)};
  }
`

const CalendarInput = React.forwardRef((props: any) => {
  return (
    <Flex>
      <Input ref={props.ref} {...props} />
      <StyledCalendarIcon {...props} />
    </Flex>
  )
})
CalendarInput.displayName = 'CalendarInput'

interface PickerProps {
  value: Date | null
  onChange: (date: Date) => void
  placeholder: string
  minimum?: Date
  maximum?: Date
}

export default function DateTimeInput({ value, placeholder, minimum, maximum, onChange }: PickerProps) {
  const ref = React.createRef()
  return (
    <>
      <StyledDatePicker
        customInput={<CalendarInput selected={value || value === false} ref={ref} />}
        dateFormat="yyyy-MM-dd HH:mm"
        renderDayContents={(day: number) => {
          return <StyledDay>{day}</StyledDay>
        }}
        placeholderText={placeholder}
        selected={value}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        filterTime={time => {
          if (!minimum) return true
          const dateTime = new Date(time)
          if (dateTime.getMonth() !== minimum.getMonth() || dateTime.getDate() !== minimum.getDate()) return true
          return dateTime.getTime() >= minimum.getTime()
        }}
        minDate={minimum}
        maxDate={maximum}
      />
    </>
  )
}
