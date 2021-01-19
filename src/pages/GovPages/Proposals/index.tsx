import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass'

import { TYPE } from '../../../theme'
import { PageWrapper } from '../../Pool/styleds'
import { useRouter } from '../../../hooks/useRouter'

import { LightCard } from '../../../components/Card'
import { RowBetween } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import TabBar from '../../../components/TabBar'
import ProposalCard, { ProposalProps } from './ProposalCard'
import { Redirect } from 'react-router-dom'

const ContentCard = styled(LightCard)`
  background: linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay, normal;
  border-radius: 8px;
  padding: 25px 20px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;    
  `};
`

const ContentTitle = styled(TYPE.body)`
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
  color: ${({ theme }) => theme.purple2};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
  margin-right: 8px;
`

const fakeProposalData: ProposalProps[] = [
  {
    id: 3,
    title: 'USDC/ETH Pool Fee to 0.15%',
    totalVote: 23,
    for: 20,
    against: 3,
    createdAt: new Date('Jan 12, 2021 03:24:00').getTime()
  }
]

export default function GovernanceProposals() {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const router = useRouter()
  const pairName = t(router.query.asset) + '/' + t(router.query.pair)
  const currency = router.location.state?.currency
  const currency1 = router.location.state?.currency1

  if (currency === undefined || currency1 === undefined) {
    return <Redirect to="/" />
  }

  return (
    <PageWrapper>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow margin="1rem" padding="0">
            <Flex alignItems="center">
              <TYPE.mediumHeader color={theme.text4} lineHeight="24.38px" fontWeight={400}>
                {t('governance') + ' /'}
              </TYPE.mediumHeader>
              &nbsp;
              <CurrencyLogo size="20px" currency={currency} />
              <CurrencyLogo size="20px" currency={currency1} />
              &nbsp;
              <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal">
                {pairName}
              </TYPE.mediumHeader>
            </Flex>
            <Flex>
              <ResponsiveButtonSecondary id="pair-stats" padding="8px 14px">
                <Text fontWeight={700} fontSize={12}>
                  {pairName + ' STATS'}
                </Text>
              </ResponsiveButtonSecondary>
              <ResponsiveButtonPrimary id="create-proposal-button" padding="8px 14px">
                <Text fontWeight={700} fontSize={12}>
                  CREATE PROPOSAL
                </Text>
              </ResponsiveButtonPrimary>
            </Flex>
          </TitleRow>
        </AutoColumn>
        <ContentCard>
          <AutoColumn gap="md">
            <Flex>
              <CurrencyLogo size="20px" currency={currency} />
              <CurrencyLogo size="20px" currency={currency1} />
              <TYPE.mediumHeader
                marginLeft="10px"
                color={theme.white}
                fontWeight={600}
                lineHeight="19.5px"
                fontSize="16px"
              >
                {pairName}
              </TYPE.mediumHeader>
            </Flex>
            <RowBetween>
              <ContentTitle>Total Liquidity:</ContentTitle>
              <ContentTitle>$146,787</ContentTitle>
            </RowBetween>
            <RowBetween>
              <ContentTitle>Volume:</ContentTitle>
              <Flex alignItems="center">
                <ContentTitle marginRight="8px">199.976</ContentTitle>
                <CurrencyLogo currency={currency} size="20px" />
              </Flex>
            </RowBetween>
            <RowBetween>
              <ContentTitle>Pool fees:</ContentTitle>
              <ContentTitle>0.05%</ContentTitle>
            </RowBetween>
            <RowBetween>
              <ContentTitle>Your DAO power:</ContentTitle>
              <ContentTitle>0.4%</ContentTitle>
            </RowBetween>
          </AutoColumn>
        </ContentCard>
        <TabBar
          tabs={[
            {
              title: 'Proposals',
              // eslint-disable-next-line react/display-name
              render: () => (
                <>
                  {fakeProposalData.map((ele, index) => (
                    <ProposalCard
                      key={index}
                      id={ele.id}
                      title={ele.title}
                      totalVote={ele.totalVote}
                      for={ele.for}
                      against={ele.against}
                      createdAt={ele.createdAt}
                    />
                  ))}
                </>
              )
            },
            {
              title: 'Proposals history',
              // eslint-disable-next-line react/display-name
              render: () => <TYPE.largeHeader>No Proposals Yet</TYPE.largeHeader>
            }
          ]}
        />
      </AutoColumn>
    </PageWrapper>
  )
}
