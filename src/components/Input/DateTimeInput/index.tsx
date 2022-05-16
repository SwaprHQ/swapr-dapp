import React from 'react'
import Datepicker from 'react-datepicker'
import styled from 'styled-components'
import { StyledInput } from '../styleds'
import { ReactComponent as CalendarIcon } from '../../../assets/svg/calendar.svg'
import { Flex } from 'rebass'

const Input = styled(StyledInput)`
  position: relative;
  border: solid 1px ${props => props.theme.bg5};
  border-radius: 8px;
  min-width: 154px;
  font-size: 11px;
  font-weight: 600;
  line-height: 11px;
  letter-spacing: 0.08em;
  height: 30px;
  padding-left: 12px;
  padding-right: 12px;
  color: ${props => props.theme.text2};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  line-height: 11px;
`

const StyledDay = styled.span`
  font-family: Montserrat;
  font-size: 11px;
  color: ${props => props.theme.text2};
`
const StyledDatePicker = styled(Datepicker)`
  ::placeholder {
    color: ${props => props.theme.text2};
  }
`
const StyledCalendarIcon = styled(CalendarIcon)`
  position: absolute;
  top: 7px;
  right: 8px;
  pointer-events: all;
  z-index: 100;
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
        customInput={<CalendarInput ref={ref} />}
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
