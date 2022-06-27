import { ButtonPrimary } from 'components/Button'
import Row from 'components/Row'
import { TagFailed, TagSuccess, TagWarning } from 'components/Tag'
import React from 'react'
import { Box } from 'rebass'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'

const Wrapper = styled.div`
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1And2};
`

const Card = styled(Box)`
  display: flex;
  flex-flow: column nowrap;
  padding: 24px;
  gap: 16px;
`

export const StyledExternalLink = styled(ExternalLink)`
  font-size: 13px;
  font-style: italic;
  text-decoration: underline;

  &:hover {
    color: white;
  }
`

type StatusTags = 'active' | 'upcoming' | 'expired'

export interface TaskCardProps {
  duration?: 'Weekly' | 'Daily'
  status: StatusTags
  title: string
  description: string
  buttonText: string
  infoLink?: string
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

export const TaskCard = ({ duration = 'Weekly', title, description, infoLink, status, buttonText }: TaskCardProps) => {
  return (
    <Wrapper>
      <Card>
        <Row justifyContent={'space-between'}>
          <TYPE.white fontSize={'12px'} fontWeight={700}>
            {duration}
          </TYPE.white>
          <StatusTag status={status} />
        </Row>

        <TYPE.white fontSize="20px">{title}</TYPE.white>

        <TYPE.white fontSize="14px">{description}</TYPE.white>

        {infoLink && <StyledExternalLink href={infoLink}>More info</StyledExternalLink>}
        <ButtonPrimary padding="8px">{buttonText}</ButtonPrimary>
      </Card>
    </Wrapper>
  )
}
