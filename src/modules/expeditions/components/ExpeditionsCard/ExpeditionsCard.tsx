import { ButtonPrimary } from '../../../../components/Button'
import Row from '../../../../components/Row'
import { TagFailed, TagSuccess, TagWarning } from '../../../../components/Tag'
import { TYPE } from '../../../../theme'
import { Card, StyledExternalLink, Wrapper } from './ExpeditionsCard.styled'

type StatusTags = 'active' | 'upcoming' | 'expired'

export interface TaskCardProps {
  duration?: 'Weekly' | 'Daily'
  status: StatusTags
  title: string
  description: string
  buttonText: string
  butttonDisabled?: boolean
  infoLink?: string
  onClick?: () => void
}

const StatusTag = ({ status }: Pick<TaskCardProps, 'status'>) => {
  switch (status) {
    case 'active':
      return <TagSuccess>Active</TagSuccess>
    case 'upcoming':
      return <TagWarning>Upcoming</TagWarning>
    case 'expired':
      return <TagFailed>Expired</TagFailed>
  }
}

// Buttons to be implemented as needed. Maybe fixed set of buttons or button can be passed as child

export function TaskCard({
  duration = 'Weekly',
  title,
  description,
  infoLink,
  status,
  buttonText,
  butttonDisabled = false,
  onClick,
}: TaskCardProps) {
  return (
    <Wrapper>
      <Card>
        <Row justifyContent={'space-between'}>
          <TYPE.White fontSize={'12px'} fontWeight={700}>
            {duration}
          </TYPE.White>
          <StatusTag status={status} />
        </Row>
        <TYPE.White fontSize="20px">{title}</TYPE.White>
        <TYPE.White fontSize="14px">{description}</TYPE.White>
        {infoLink && <StyledExternalLink href={infoLink}>More info</StyledExternalLink>}
        <ButtonPrimary padding="8px" onClick={onClick} disabled={butttonDisabled}>
          {buttonText}
        </ButtonPrimary>
      </Card>
    </Wrapper>
  )
}
