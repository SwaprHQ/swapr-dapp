import React from 'react'
import { Box, Flex } from 'rebass'
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
      <StyledSmoothGradientCard width="466px" padding={'28px 33.5px'} marginRight={'28px'}>
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
        padding={'33.5px 41px '}
        width={'266px'}
        flexDirection={'column'}
      >
        <Box mb="auto" mt={'8px'}>
          <TYPE.small
            fontSize={'11px'}
            textAlign={'start'}
            fontWeight="600"
            lineHeight={'13px'}
            color="text4"
            letterSpacing="8%"
          >
            TIME LOCKED STAKING
          </TYPE.small>
        </Box>
        <Flex alignItems={'start'}>
          {/* <Toggle isActive={timelocked} toggle={onTimelockedChange} /> */}
          <TYPE.small>{timelocked ? 'ON' : 'OFF'}</TYPE.small>
          <StyledSwitch handleToggle={onTimelockedChange} isOn={timelocked} label={'TIME LOCKED'} />
        </Flex>
      </SmoothGradientCard>
    </FlexWrapper>
  )
}
