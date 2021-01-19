import React, { useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Flex } from 'rebass'
import { TYPE } from '../../../theme'
import HourGlass from '../../../assets/svg/hourglass.svg'

import Card, { LightCard } from '../../../components/Card'
import { AutoColumn } from '../../../components/Column'
import { RowBetween } from '../../../components/Row'
import useInterval from '../../../hooks/useInterval'

const Container = styled(LightCard)`
  padding: 1rem 1.25rem;
  height: 76px;
  position: relative;
  cursor: pointer;
  border: none;
  background: linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay, normal;

  ::before {
    content: '';
    background-image: linear-gradient(180deg, ${({ theme }) => theme.bg2} 0%, ${({ theme }) => theme.bg3} 100%);
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    position: absolute;
    z-index: -1;
    border-radius: 8px;
  }
`

const InfoText = styled(TYPE.main)`
  font-size: 10px;
  font-weight: 600 !important;
  line-height: 12px;
  font-style: normal;
  color: ${({ theme }) => theme.purple3};
`

const TextCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.purple3};
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

export interface ProposalProps {
  id: number
  title: string
  totalVote: number
  for: number
  against: number
  createdAt: number
}

export default function ProposalCard(props: ProposalProps) {
  const theme = useContext(ThemeContext)
  const [counter, setCounter] = useState<number>(Math.round((Date.now() - props.createdAt) / 1000)) // displays in second

  const FOR = ((props.for / props.totalVote) * 100).toFixed(0) + '%'
  const AGAINST = ((props.against / props.totalVote) * 100).toFixed(0) + '%'

  useInterval(() => {
    setCounter(counter + 1)
  }, 1000)

  const formatTimeStamp = (timestamp: number): string => {
    const day = (timestamp - (timestamp % 86400)) / 86400
    const hour = (timestamp - day * 86400 - (timestamp % 3600)) / 3600
    const minute = (timestamp - day * 86400 - hour * 3600 - (timestamp % 60)) / 60
    return `${day}d ${hour}h ${minute}m`
  }

  return (
    <Container>
      <RowBetween>
        <AutoColumn gap="sm">
          <Flex alignItems="center">
            <TextCard>
              <InfoText>{'#' + ('00' + props.id).slice(-3)}</InfoText>
            </TextCard>
            <img src={HourGlass} alt="HourGlass" style={{ width: '6px', height: '10px', marginLeft: '10px' }} />
            <InfoText marginLeft="5px" marginRight="10px">
              {formatTimeStamp(counter)}
            </InfoText>
            <InfoText>|</InfoText>
            <InfoText marginLeft="5px">{props.totalVote + ' Voted'}</InfoText>
          </Flex>
          <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal">
            {props.title}
          </TYPE.mediumHeader>
        </AutoColumn>
        <AutoColumn gap="sm" style={{ width: '105px' }}>
          <RowBetween>
            <InfoText>FOR</InfoText>
            <InfoText color={theme.green2}>{FOR}</InfoText>
          </RowBetween>
          <RowBetween>
            <InfoText>AGAINST</InfoText>
            <InfoText color={theme.red1}>{AGAINST}</InfoText>
          </RowBetween>
          <RowBetween>
            <Progress width={FOR} isFor={true} />
            <Progress width={AGAINST} isFor={false} />
          </RowBetween>
        </AutoColumn>
      </RowBetween>
    </Container>
  )
}
