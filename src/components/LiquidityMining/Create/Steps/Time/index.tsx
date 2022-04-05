import React from 'react'
import { Flex } from 'rebass'
import { TYPE } from '../../../../../theme'
import TimeSelector from './TimeSelector'
//import Toggle from '../../../../Toggle'
import { HorizontalDivider, SmoothGradientCard } from '../../../styleds'
import styled from 'styled-components'
import { Switch } from '../../../../Switch'

const StyledSmoothGradientCard = styled(SmoothGradientCard)`
  z-index: 100 !important;
`
const StyledSwitch = styled(Switch)`
  color: red;
  label {
    span {
      background-color: black !important;
    }
  }
`
const FlexWrapper = styled(Flex)`
  height: 150px;
  align-items: start !important;
`
interface TimeProps {
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  onStartTimeChange: (date: Date) => void
  onEndTimeChange: (date: Date) => void
  onTimelockedChange: () => void
}

export default function Time({
  startTime,
  endTime,
  timelocked,
  onStartTimeChange,
  onEndTimeChange,
  onTimelockedChange
}: TimeProps) {
  return (
    <FlexWrapper>
      <StyledSmoothGradientCard width="466px" padding={'42.5px 28px'} marginRight={'28px'}>
        <TimeSelector
          title="STARTING"
          placeholder="Start date"
          value={startTime}
          minimum={new Date()}
          onChange={onStartTimeChange}
        />

        <HorizontalDivider />

        <TimeSelector
          title="ENDING"
          placeholder="End date"
          value={endTime}
          minimum={startTime || new Date()}
          onChange={onEndTimeChange}
        />
      </StyledSmoothGradientCard>

      <SmoothGradientCard
        textAlign={'start'}
        alignItems={'start'}
        padding={'41px'}
        width={'266px'}
        flexDirection={'column'}
      >
        <TYPE.small
          alignSelf={'start'}
          marginBottom={'auto'}
          fontSize={'11px'}
          textAlign={'start'}
          fontWeight="600"
          lineHeight={'13px'}
          color="text3"
          letterSpacing="0.08em"
        >
          TIME LOCKED STAKING
        </TYPE.small>

        <Flex alignItems={'start'}>
          <TYPE.small fontWeight={'600'} alignSelf="center" color={'purple3'}>
            {timelocked ? 'ON' : 'OFF'}
          </TYPE.small>
          <StyledSwitch handleToggle={onTimelockedChange} isOn={timelocked} label={'TIME LOCKED'} />
        </Flex>
      </SmoothGradientCard>
    </FlexWrapper>
  )
}
