import React from 'react'
import { Flex } from 'rebass'
import { TYPE } from '../../../../../theme'
import TimeSelector from './TimeSelector'
//import Toggle from '../../../../Toggle'
import { HorizontalDivider, SmoothGradientCard } from '../../../styleds'
import styled from 'styled-components'
import { Switch } from '../../../../Switch'
import { ReactComponent as LockSvg } from '../../../../../assets/svg/lock.svg'

const StyledSmoothGradientCard = styled(SmoothGradientCard)`
  z-index: 100 !important;
`
const StyledSwitch = styled(Switch)`
  /* color: red;
  label {
    span {
      background-color: black !important;
    }
  } */
`
const StyledLockText = styled(TYPE.small)<{ active: boolean }>`
  font-weight: 600 !important;
  align-self: center;
  white-space: nowrap;
  color: ${props => (props.active ? props.theme.white : props.theme.purple3)};
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
  console.log(timelocked)
  return (
    <FlexWrapper>
      <StyledSmoothGradientCard width="auto" padding={'42.5px 28px'} marginRight={'28px'}>
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
        width={'299px'}
        flexDirection={'column'}
        justifyContent={'space-around !important'}
      >
        <Flex alignSelf={'start'}>
          <LockSvg />
          <TYPE.small
            marginLeft="4px"
            fontSize={'11px'}
            textAlign={'start'}
            fontWeight="600"
            lineHeight={'13px'}
            color="text3"
            letterSpacing="0.08em"
          >
            TIME LOCKED STAKING
          </TYPE.small>
        </Flex>

        <Flex alignItems={'start'}>
          <StyledLockText active={!timelocked}>UNLOCKED</StyledLockText>

          <StyledSwitch handleToggle={() => onTimelockedChange()} isOn={timelocked} />
          <StyledLockText active={timelocked} marginLeft="8px">
            TIME LOCKED
          </StyledLockText>
        </Flex>
      </SmoothGradientCard>
    </FlexWrapper>
  )
}
