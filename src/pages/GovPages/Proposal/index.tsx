import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'
import { ETHER } from 'dxswap-sdk'
import { ChevronLeft } from 'react-feather'

import { USDC } from '../../../constants'
import { TYPE } from '../../../theme'
import { PageWrapper } from '../../Pool/styleds'
import { RowBetween } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import CurrencyLogo from '../../../components/CurrencyLogo'
import HourGlass from '../../../assets/svg/hourglass.svg'
import Done from '../../../assets/svg/done_all.svg'
import Block from '../../../assets/svg/block.svg'
import {
  Container,
  ContentTitle,
  InfoText,
  TextCard,
  ContentCard,
  ProgressDiv,
  VoteButton,
  ProposerAddress
} from './styleds'
import { useRouter } from '../../../hooks/useRouter'
import { fakeProposalData } from '../constant'
import { Failed, InProgress, Passed, VoteStatus } from '../VoteStatus'

const pairName = 'USDC/ETH'
const currency = USDC
const currency1 = ETHER

export default function GovernanceProposals() {
  const router = useRouter()
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const proposalInfo = fakeProposalData[parseInt(router.query.id) - 1]
  const isEnded = Date.now() > proposalInfo.until
  const voteStatus = !isEnded ? InProgress : proposalInfo.for > proposalInfo.against ? Passed : Failed

  const [isVoted, setIsVoted] = useState<{ isVoted: boolean; result: null | boolean }>({
    isVoted: false,
    result: null
  })
  const [totalVote, setTotalVote] = useState({ for: proposalInfo.for, against: proposalInfo.against })
  const [percentage, setPercentage] = useState({ for: '0%', against: '0%' })

  useEffect(() => {
    setPercentage({
      for: ((totalVote.for / (totalVote.for + totalVote.against)) * 100).toFixed(0) + '%',
      against: ((totalVote.against / (totalVote.for + totalVote.against)) * 100).toFixed(0) + '%'
    })
  }, [totalVote])

  const onBack = useCallback(() => {
    router.history.goBack()
  }, [router.history])

  const onFor = useCallback(() => {
    if (isEnded) return
    if (isVoted.isVoted) return
    setTotalVote(prev => ({
      ...prev,
      for: prev.for + 1
    }))
    setIsVoted({
      isVoted: true,
      result: true
    })
  }, [isEnded, isVoted.isVoted])

  const onAgainst = useCallback(() => {
    if (isEnded) return
    if (isVoted.isVoted) return
    setTotalVote(prev => ({
      ...prev,
      against: prev.against + 1
    }))
    setIsVoted({
      isVoted: true,
      result: false
    })
  }, [isEnded, isVoted.isVoted])

  return (
    <PageWrapper>
      <AutoColumn gap="20px" justify="center">
        <Flex alignItems="center" width="100%">
          <a href="#/governance">
            <TYPE.mediumHeader color={theme.text4} lineHeight="24.38px" fontWeight={400}>
              {t('governance') + ' /'}
            </TYPE.mediumHeader>
          </a>
          <CurrencyLogo size="20px" currency={currency} style={{ marginLeft: '6px' }} />
          <CurrencyLogo size="20px" currency={currency1} style={{ marginRight: '6px' }} />
          <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal">
            {pairName}
          </TYPE.mediumHeader>
        </Flex>
        <Flex alignItems="center" width="100%" style={{ cursor: 'pointer' }} onClick={onBack}>
          <ChevronLeft size="15px" color={theme.text5} style={{ marginRight: '5px' }} />
          <TYPE.main fontWeight={500} fontStyle="normal" fontSize="14px" lineHeight="17.07px" color={theme.text5}>
            Back to All Pool Proposals
          </TYPE.main>
        </Flex>
        <Container>
          <AutoColumn gap="16px">
            <Flex marginBottom="4px" justifyContent="flex-start" alignItems="center">
              <TextCard status={voteStatus}>
                <InfoText status={voteStatus}>
                  {'#' + ('00' + proposalInfo.id).slice(-3) + (voteStatus !== InProgress ? ' ' + voteStatus : '')}
                </InfoText>
              </TextCard>
              {voteStatus !== InProgress && (
                <img
                  src={voteStatus === Passed ? Done : Block}
                  alt="Done"
                  style={{ width: '20px', height: '20px', marginLeft: '5px' }}
                />
              )}
              <TYPE.mediumHeader
                marginLeft="5px"
                color={voteStatus === InProgress ? 'white' : VoteStatus[voteStatus]}
                fontWeight={600}
                lineHeight="19.5px"
                fontSize="16px"
              >
                {proposalInfo.title}
              </TYPE.mediumHeader>
            </Flex>
            <Flex>
              <ContentCard>
                <AutoColumn gap="10px">
                  <Flex justifyContent="space-between">
                    <ContentTitle>Current Pool fee:</ContentTitle>
                    <ContentTitle>0.05%</ContentTitle>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <ContentTitle big>Proposed Pool Fee:</ContentTitle>
                    <ContentTitle big>0.15%</ContentTitle>
                  </Flex>
                </AutoColumn>
              </ContentCard>
            </Flex>
            <Flex>
              <ContentCard>
                <AutoColumn gap="10px">
                  <Flex justifyContent="space-between">
                    <ContentTitle>Your voting power:</ContentTitle>
                    <ContentTitle>13%</ContentTitle>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <ContentTitle>Pooled USDC:</ContentTitle>
                    <Flex alignItems="center">
                      <ContentTitle marginRight="8px">199.976</ContentTitle>
                      <CurrencyLogo currency={USDC} size="20px" />
                    </Flex>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <ContentTitle>Pooled ETH:</ContentTitle>
                    <Flex alignItems="center">
                      <ContentTitle marginRight="8px">0.578568</ContentTitle>
                      <CurrencyLogo currency={ETHER} size="20px" />
                    </Flex>
                  </Flex>
                </AutoColumn>
              </ContentCard>
            </Flex>
            <RowBetween>
              <TYPE.main
                fontWeight={600}
                fontStyle="normal"
                fontSize="11px"
                lineHeight="11px"
                letterSpacing="4%"
                color="text4"
              >
                TOTAL VOTES: {totalVote.for + totalVote.against} VOTES
              </TYPE.main>
              <Flex>
                <img src={HourGlass} alt="HourGlass" style={{ width: '6px', height: '10px', marginRight: '5px' }} />
                <TYPE.main
                  fontWeight={600}
                  fontStyle="normal"
                  fontSize="11px"
                  lineHeight="11px"
                  letterSpacing="4%"
                  color="text4"
                >
                  {voteStatus === InProgress ? 'TIME LEFT' : voteStatus}: 1D 23H 32M
                </TYPE.main>
              </Flex>
            </RowBetween>
            <RowBetween>
              <ContentCard
                marginRight="9px"
                padding="16px !important"
                bgColor={
                  voteStatus !== InProgress && totalVote.for > totalVote.against
                    ? 'linear-gradient(170.32deg, rgba(14, 159, 110, 0.75) -292.86%, rgba(14, 159, 110, 0) 103.41%), #171621;'
                    : undefined
                }
              >
                <AutoColumn gap="17px">
                  <RowBetween>
                    <TYPE.main fontWeight={600} fontStyle="normal" fontSize="14px" lineHeight="17px" letterSpacing="4%">
                      For
                    </TYPE.main>
                    <TYPE.main fontWeight={600} fontStyle="normal" fontSize="11px" lineHeight="11px" letterSpacing="4%">
                      {totalVote.for} votes | {percentage.for}
                    </TYPE.main>
                  </RowBetween>
                  <Flex>
                    <ProgressDiv width={percentage.for} color={theme.green2} />
                    <ProgressDiv width={percentage.against} color={theme.dark1} />
                  </Flex>
                  <VoteButton
                    onClick={onFor}
                    bgColor={isVoted.isVoted && isVoted.result ? 'transparent' : theme.green2}
                    border={isVoted.result ? `1px solid ${theme.green2}` : 'none'}
                    opacity={isEnded || (isVoted.isVoted && isVoted.result === false) ? '0.32' : '1'}
                    color={isVoted.result ? theme.green2 : 'white'}
                  >
                    {isVoted.isVoted && isVoted.result ? (
                      <>
                        <img src={Done} alt="Done" style={{ width: '18px', height: '15px', marginRight: '4px' }} />
                        YOU VOTED FOR
                      </>
                    ) : (
                      'VOTE FOR'
                    )}
                  </VoteButton>
                </AutoColumn>
              </ContentCard>
              <ContentCard
                marginLeft="9px"
                padding="16px !important"
                bgColor={
                  voteStatus !== InProgress && totalVote.for <= totalVote.against
                    ? 'linear-gradient(176.29deg, rgba(237, 66, 102, 0.6) -241.75%, rgba(237, 66, 102, 0) 110.04%), #171621;'
                    : undefined
                }
              >
                <AutoColumn gap="17px">
                  <RowBetween>
                    <TYPE.main fontWeight={600} fontStyle="normal" fontSize="14px" lineHeight="17px" letterSpacing="4%">
                      Against
                    </TYPE.main>
                    <TYPE.main fontWeight={600} fontStyle="normal" fontSize="11px" lineHeight="11px" letterSpacing="4%">
                      {totalVote.against} votes | {percentage.against}
                    </TYPE.main>
                  </RowBetween>
                  <Flex>
                    <ProgressDiv width={percentage.against} color={theme.red1} />
                    <ProgressDiv width={percentage.for} color={theme.dark1} />
                  </Flex>
                  <VoteButton
                    onClick={onAgainst}
                    bgColor={isVoted.isVoted && isVoted.result === false ? 'transparent' : theme.red1}
                    border={isVoted.result === false ? `1px solid ${theme.red1}` : 'none'}
                    opacity={isEnded || (isVoted.isVoted && isVoted.result) ? '0.32' : '1'}
                    color={isVoted.result === false ? theme.red1 : 'white'}
                  >
                    {isVoted.isVoted && isVoted.result === false ? (
                      <>
                        <img src={Block} alt="Done" style={{ width: '18px', height: '15px', marginRight: '4px' }} />
                        YOU VOTED AGAINST
                      </>
                    ) : (
                      'VOTE AGAINST'
                    )}
                  </VoteButton>
                </AutoColumn>
              </ContentCard>
            </RowBetween>
            <ProposerAddress letterSpacing="0.08em">
              Proposer: 0xB5806a701c2ae0366e15BDe9bE140E82190fa3d6
            </ProposerAddress>
          </AutoColumn>
        </Container>
      </AutoColumn>
    </PageWrapper>
  )
}
