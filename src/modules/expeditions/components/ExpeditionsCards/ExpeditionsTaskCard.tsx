import { Flex } from 'rebass'

import { ReactComponent as ClockSvg } from '../../../../assets/images/clock.svg'
import Countdown from '../../../../components/Countdown'
import Row from '../../../../components/Row'
import { TYPE } from '../../../../theme'
import { Card, ExpeditionsButton, StyledExternalLink, Wrapper } from '../shared'
import { StatusTag, StatusTags } from './ExpeditionsTags'

export interface TaskCardProps {
  duration?: 'Weekly' | 'Daily'
  status: StatusTags
  title: string
  description: string
  buttonText: React.ReactNode
  buttonDisabled?: boolean
  infoLink?: string
  onClick?: () => void
  claimed?: boolean
}

// Buttons to be implemented as needed. Maybe fixed set of buttons or button can be passed as child

export function TaskCard({
  duration = 'Weekly',
  title,
  description,
  infoLink,
  status,
  buttonText,
  buttonDisabled = false,
  onClick,
  claimed = false,
}: TaskCardProps) {
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
                <Countdown to={1666728691} excludeSeconds />
              </TYPE.Body>
            </Flex>
          </Row>
          <Row justifyContent={'space-between'}>
            <TYPE.White fontSize="20px" paddingTop={'8px'}>
              {title}
            </TYPE.White>
            <div style={{ alignSelf: 'flex-start' }}>
              <StatusTag status={status} />
            </div>
          </Row>
        </Row>
        <TYPE.White fontSize="14px">{description}</TYPE.White>
        {infoLink && <StyledExternalLink href={infoLink}>More info</StyledExternalLink>}
        <ExpeditionsButton onClick={onClick} disabled={buttonDisabled} confirmed={claimed}>
          {buttonText}
        </ExpeditionsButton>
      </Card>
    </Wrapper>
  )
}
