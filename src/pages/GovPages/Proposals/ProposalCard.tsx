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

const Container = styled(LightCard)<{ isPassed: number }>`
  // 0 - voting in progress
  // 1 - passed
  // 2 - failed
  padding: 1.25rem;
  height: 88px;
  position: relative;
  cursor: pointer;
  background: ${({ isPassed, theme }) =>
    isPassed === 0
      ? `linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%), ${theme.dark1}`
      : `linear-gradient(141.72deg, ${theme.bg1} -11.46%, ${
          isPassed === 1 ? 'rgba(5, 122, 85, 0.5)' : 'rgba(238, 46, 81, 0.5)'
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

const InfoText = styled(TYPE.main)<{ isPassed: number; small?: boolean }>`
  font-style: normal;
  font-weight: bold !important;
  font-size: ${({ small }) => (small ? '9.5px !important' : '10px')};
  line-height: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme, isPassed }) => (isPassed === 0 ? theme.purple3 : isPassed === 1 ? theme.green2 : theme.red1)};
`

const TextCard = styled(Card)<{ isPassed: number }>`
  border: 1px solid
    ${({ theme, isPassed }) => (isPassed === 0 ? theme.purple3 : isPassed === 1 ? theme.green2 : theme.red1)};
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
  for: number // percentage value
  against: number // percentage value
  isEnded: boolean
  until: number
  onClick: () => void
}

export default function ProposalCard(props: ProposalCardProps) {
  const theme = useContext(ThemeContext)
  const [counter, setCounter] = useState<number>(Math.round((Date.now() - props.until) / 1000)) // displays in second

  useInterval(() => {
    setCounter(counter + 1)
  }, 1000)

  const formatTimeStamp = (origin: number): string => {
    const timestamp = Math.abs(origin)
    const day = (timestamp - (timestamp % 86400)) / 86400
    const hour = (timestamp - day * 86400 - (timestamp % 3600)) / 3600
    const minute = (timestamp - day * 86400 - hour * 3600 - (timestamp % 60)) / 60
    return `${day}D ${hour}H ${minute}M${props.isEnded ? ' AGO' : ''}`
  }

  const isPassed = !props.isEnded ? 0 : props.for > props.against ? 1 : 2
  return (
    <Container isPassed={isPassed} onClick={props.onClick}>
      <RowBetween>
        <AutoColumn gap="sm">
          <Flex alignItems="center">
            <TextCard isPassed={isPassed}>
              <InfoText isPassed={isPassed} fontWeight={'600 !important'} letterSpacing={'2% !important'}>
                {'#' + ('00' + props.id).slice(-3) + (isPassed === 1 ? ' PASSED' : isPassed === 2 ? ' FAILED' : '')}
              </InfoText>
            </TextCard>
            {!props.isEnded ? (
              <img src={HourGlass} alt="HourGlass" style={{ width: '6px', height: '10px', marginLeft: '10px' }} />
            ) : (
              <Clock size={12} style={{ marginLeft: '10px' }} color={theme.purple2} />
            )}
            <InfoText isPassed={0} marginLeft="5px" marginRight="10px">
              {formatTimeStamp(counter)}
            </InfoText>
            <InfoText isPassed={0}>|</InfoText>
            <InfoText isPassed={0} marginLeft="5px">
              {props.totalVote + ' VOTED'}
            </InfoText>
          </Flex>
          <Row>
            {isPassed === 1 ? (
              <img src={Done} alt="Done" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
            ) : isPassed === 2 ? (
              <img src={Block} alt="Block" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
            ) : (
              <></>
            )}
            <TYPE.mediumHeader
              lineHeight="19.5px"
              fontWeight={600}
              fontSize="16px"
              fontStyle="normal"
              color={theme.text3}
            >
              {props.title}
            </TYPE.mediumHeader>
          </Row>
        </AutoColumn>
        <AutoColumn gap={'4px'} style={{ width: '105px' }}>
          <RowBetween>
            <InfoText isPassed={isPassed === 1 ? 1 : 0} small>
              FOR
            </InfoText>
            <InfoText isPassed={isPassed !== 2 ? 1 : 0} small>
              {props.for + '%'}
            </InfoText>
          </RowBetween>
          <RowBetween>
            <InfoText isPassed={isPassed === 2 ? 2 : 0} small>
              AGAINST
            </InfoText>
            <InfoText isPassed={isPassed !== 1 ? 2 : 0} small>
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
