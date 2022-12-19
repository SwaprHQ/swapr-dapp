import { useCallback, useEffect, useState } from 'react'
import { Flex } from 'rebass'

import { ReactComponent as ClockSvg } from '../../../../assets/images/clock.svg'
import Countdown from '../../../../components/Countdown'
import Row from '../../../../components/Row'
import { TYPE } from '../../../../theme'
import { Card, ExpeditionsButton, StyledExternalLink, Wrapper } from '../shared'
import { StatusTag, StatusTags } from './ExpeditionsTags'

export interface TaskCardProps {
  duration?: 'Weekly' | 'Daily'
  title: string
  description: React.ReactNode
  button: React.ReactNode
  buttonDisabled?: boolean
  infoLink?: string
  onClick?: () => void
  claimed?: boolean
  endDate: Date
  startDate: Date
  overwriteStatus?: StatusTags
}

// Buttons to be implemented as needed. Maybe fixed set of buttons or button can be passed as child

export function TaskCard({
  duration = 'Weekly',
  title,
  description,
  infoLink,
  button,
  buttonDisabled = false,
  onClick,
  claimed = false,
  startDate,
  endDate,
  overwriteStatus,
}: TaskCardProps) {
  const [upcoming, setUpcoming] = useState(false)
  const [expired, setExpired] = useState(false)
  const [currentPeriodEnded, setCurrentPeriodEnded] = useState(false)

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000)
    setExpired(!!(endDate && endDate.getTime() / 1000 < now))
    setUpcoming(!!(startDate && startDate.getTime() / 1000 > now))
    setCurrentPeriodEnded(false)
  }, [endDate, startDate, currentPeriodEnded])

  const handleCountdownEnd = useCallback(() => {
    setCurrentPeriodEnded(true)
  }, [])

  const statusTag = overwriteStatus ? overwriteStatus : upcoming ? 'upcoming' : expired ? 'expired' : 'active'

  return (
    <Wrapper>
      <Card flexDirection={'column'}>
        <Row flexDirection={'column'}>
          <Row justifyContent={'space-between'}>
            <TYPE.White fontSize={'12px'} fontWeight={700}>
              {duration}
            </TYPE.White>
            <Flex width="max-content" alignItems="center">
              <ClockSvg width={'10px'} height={'10px'} />
              <TYPE.Body marginLeft="4px" fontSize="10px" fontWeight="500">
                <Countdown
                  to={upcoming ? startDate.getTime() / 1000 : expired ? 0 : endDate.getTime() / 1000}
                  excludeSeconds
                  onEnd={handleCountdownEnd}
                />
              </TYPE.Body>
            </Flex>
          </Row>
          <Row justifyContent={'space-between'}>
            <TYPE.White fontSize="20px" paddingTop={'8px'}>
              {title}
            </TYPE.White>
            <div style={{ alignSelf: 'flex-start' }}>
              <StatusTag status={statusTag} />
            </div>
          </Row>
        </Row>
        <TYPE.White fontSize="14px">{description}</TYPE.White>
        {infoLink && <StyledExternalLink href={infoLink}>More info</StyledExternalLink>}
        {button && (
          <ExpeditionsButton onClick={onClick} disabled={buttonDisabled} confirmed={claimed}>
            {button}
          </ExpeditionsButton>
        )}
      </Card>
    </Wrapper>
  )
}
