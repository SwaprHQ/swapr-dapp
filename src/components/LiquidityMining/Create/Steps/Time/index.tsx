import React, { useCallback } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as LockOpenSvg } from '../../../../../assets/svg/lock-open.svg'
import { ReactComponent as LockSvg } from '../../../../../assets/svg/lock.svg'
import { TYPE } from '../../../../../theme'
import { Switch } from '../../../../Switch'
import { HorizontalDivider, SmoothGradientCard } from '../../../styleds'
import TimeSelector from './TimeSelector'

const StyledSmoothGradientCard = styled(SmoothGradientCard)`
  z-index: 100 !important;
  padding: 42.5px 28px;
  height: 150px;
  width: 413px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 21px;
    width:331px;
    height:272px;
    flex-wrap: wrap;
    gap: 12px;
    justify-content:flex-start;
  `};
`

const StyledLockText = styled(TYPE.small)<{ active: boolean }>`
  font-weight: 600 !important;
  align-self: center;
  white-space: nowrap;
  color: ${props => (props.active ? props.theme.white : props.theme.purple3)};
`
const FlexWrapper = styled(Flex)`
  flex-wrap: wrap;
  gap: 28px;
  align-items: start !important;
`
interface TimeProps {
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
  setStartTime: (date: Date | null) => void
  setEndTime: (date: Date | null) => void
  onTimelockedChange: (value?: boolean) => void
}

export default function DurationAndLocking({
  startTime,
  endTime,
  timelocked,
  setStartTime,
  setEndTime,
  onTimelockedChange,
}: TimeProps) {
  const handleStartTimeChange = useCallback(
    (newStartTime: Date) => {
      if (endTime ? newStartTime.getTime() > endTime.getTime() : Date.now() > newStartTime.getTime()) return
      setStartTime(newStartTime)
    },
    [setStartTime, endTime]
  )

  const handleEndTimeChange = useCallback(
    (newEndTime: Date | null) => {
      if (!newEndTime) {
        setEndTime(null)
        return
      }
      if (startTime ? startTime.getTime() > newEndTime.getTime() : Date.now() > newEndTime.getTime()) return // date in the past, invalid
      setEndTime(newEndTime)
    },
    [startTime, setEndTime]
  )
  return (
    <FlexWrapper>
      <StyledSmoothGradientCard>
        <TimeSelector
          data-testid="start-time-selector-box"
          title="STARTING"
          placeholder="Start date"
          value={startTime}
          minimum={new Date()}
          onChange={handleStartTimeChange}
        />

        <HorizontalDivider />

        <TimeSelector
          data-testid="end-time-selector-box"
          title="ENDING"
          placeholder="End date"
          value={endTime}
          minimum={startTime || new Date()}
          onChange={handleEndTimeChange}
        />
      </StyledSmoothGradientCard>

      <SmoothGradientCard
        textAlign={'start'}
        alignItems={'start'}
        padding={'41px'}
        width={'299px'}
        height={'150px'}
        flexDirection={'column'}
        justifyContent={'space-around'}
      >
        <Flex alignSelf={'start'}>
          {timelocked ? <LockSvg /> : <LockOpenSvg />}
          <TYPE.small
            marginLeft="4px"
            fontSize={'11px'}
            textAlign={'start'}
            fontWeight="600"
            lineHeight={'14px'}
            color="text3"
            letterSpacing="0.08em"
          >
            TIME LOCKED STAKING
          </TYPE.small>
        </Flex>

        <Flex alignItems={'start'}>
          <StyledLockText onClick={() => onTimelockedChange(false)} active={!timelocked}>
            OFF
          </StyledLockText>
          <Switch isRed={true} handleToggle={() => onTimelockedChange()} isOn={timelocked} />
          <StyledLockText onClick={() => onTimelockedChange(true)} active={timelocked} marginLeft="8px">
            TIME LOCKED
          </StyledLockText>
        </Flex>
      </SmoothGradientCard>
    </FlexWrapper>
  )
}
