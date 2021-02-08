import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Clock } from 'react-feather'
import { Flex } from 'rebass'

import { TYPE } from '../../../theme'
import Row, { RowBetween } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import Card, { LightCard } from '../../../components/Card'

import useInterval from '../../../hooks/useInterval'

import HourGlass from '../../../assets/svg/hourglass.svg'
import Block from '../../../assets/svg/block.svg'
import Done from '../../../assets/svg/done_all.svg'

import { VoteStatus, VoteStatusType, InProgress, Passed, Failed } from '../VoteStatus'

const Container = styled(LightCard)<{ status: VoteStatusType }>`
  padding: 1.25rem;
  height: 88px;
  position: relative;
  cursor: pointer;
  background: ${({ theme, status }) =>
    status === InProgress
      ? `linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%), ${theme.dark1}`
      : `linear-gradient(141.72deg, ${theme.bg1} -11.46%, ${
          status === Passed ? 'rgba(5, 122, 85, 0.5)' : 'rgba(238, 46, 81, 0.5)'
        } 180.17%)`};
  background-blend-mode: overlay, normal;
  border: none;

  ::before {
    content: '';
    background-image: linear-gradient(180deg, #14131d 0%, rgb(68 65 99 / 50%) 100%);
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    position: absolute;
    z-index: -1;
    border-radius: 8px;
  }
`

const InfoText = styled(TYPE.main)<{ status: VoteStatusType; small?: boolean }>`
  font-style: normal;
  font-weight: bold !important;
  font-size: ${({ small }) => (small ? '9.5px !important' : '10px')};
  line-height: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme, status }) => theme[VoteStatus[status]]};
`

const TextCard = styled(Card)<{ status: VoteStatusType }>`
  border: 1px solid ${({ theme, status }) => theme[VoteStatus[status]]};
  border-radius: 4px;
  height: 16px;
  padding: 2px 6px;
  align-items: center;
  width: auto;
`

const Progress = styled.div<{ isFor: boolean; width: string }>`
  height: 2px;
  margin: 0;
  padding: 0;
  width: ${({ width }) => width};
  background-color: ${({ isFor, theme }) => (isFor ? theme.green2 : theme.red1)};
`

interface ProposalCardProps {
  id: number
  title: string
  totalVote: number
  for: number
  against: number
  ended: boolean
  until: number
}

export default function ProposalCard(props: ProposalCardProps) {
  const theme = useContext(ThemeContext)
  const [counter, setCounter] = useState<number>(Math.round((Date.now() - props.until) / 1000))

  useInterval(() => {
    setCounter(counter + 1)
  }, 1000)

  const formatTimeStamp = (origin: number): string => {
    const timestamp = Math.abs(origin)
    const day = (timestamp - (timestamp % 86400)) / 86400
    const hour = (timestamp - day * 86400 - (timestamp % 3600)) / 3600
    const minute = (timestamp - day * 86400 - hour * 3600 - (timestamp % 60)) / 60
    return `${day}D ${hour}H ${minute}M${props.ended ? ' AGO' : ''}`
  }

  const voteStatus = !props.ended ? InProgress : props.for > props.against ? Passed : Failed

  return (
    <Container status={voteStatus}>
      <RowBetween>
        <AutoColumn gap="sm">
          <Flex alignItems="center">
            <TextCard status={voteStatus}>
              <InfoText status={voteStatus} fontWeight={'600 !important'} letterSpacing={'2% !important'}>
                {'#' + ('00' + props.id).slice(-3) + (voteStatus !== InProgress ? ' ' + voteStatus : '')}
              </InfoText>
            </TextCard>
            {voteStatus === InProgress ? (
              <img
                src={HourGlass}
                alt="HourGlass"
                style={{ width: '6px', height: '10px', marginLeft: '10px', marginRight: '10px' }}
              />
            ) : (
              <Clock size={12} style={{ marginLeft: '10px', marginRight: '5px' }} color={theme.purple2} />
            )}
            <InfoText status={voteStatus}>{formatTimeStamp(counter) + ' | ' + props.totalVote + ' VOTED'}</InfoText>
          </Flex>
          <Row>
            {voteStatus !== InProgress && (
              <img
                src={voteStatus === Passed ? Done : Block}
                alt="FinishedProposal"
                style={{ width: '24px', height: '24px', marginRight: '10px' }}
              />
            )}
            <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal" color={'text3'}>
              {props.title}
            </TYPE.mediumHeader>
          </Row>
        </AutoColumn>
        <AutoColumn gap="4px" style={{ width: '105px' }}>
          <RowBetween color="red">
            <InfoText status={voteStatus === Passed ? Passed : InProgress} small>
              FOR
            </InfoText>
            <InfoText status={voteStatus !== Failed ? Passed : InProgress} small>
              {props.for + '%'}
            </InfoText>
          </RowBetween>
          <RowBetween>
            <InfoText status={voteStatus === Failed ? Failed : InProgress} small>
              AGAINST
            </InfoText>
            <InfoText status={voteStatus !== Passed ? Failed : InProgress} small>
              {props.against + '%'}
            </InfoText>
          </RowBetween>
          <RowBetween>
            <Progress width={props.for + '%'} isFor={true} />
            <Progress width={props.against + '%'} isFor={false} />
          </RowBetween>
        </AutoColumn>
      </RowBetween>
    </Container>
  )
}
