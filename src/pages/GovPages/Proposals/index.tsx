import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass'
import { ETHER } from 'dxswap-sdk'
import { USDC } from '../../../constants'

import { TYPE } from '../../../theme'
import { PageWrapper } from '../../Pool/styleds'
import { useRouter } from '../../../hooks/useRouter'

import { LightCard } from '../../../components/Card'
import { RowBetween } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { TitleRow, ResponsiveButtonPrimary, ResponsiveButtonSecondary, InfoText } from './styleds'
import TabBar from '../../../components/TabBar'
import ProposalCard, { fakeProposalData } from './ProposalCard'

export default function GovernanceProposals() {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const router = useRouter()
  const pairName = t(router.query.asset) + '/' + t(router.query.pair)

  return (
    <PageWrapper>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
            <Flex alignItems="center">
              <TYPE.mediumHeader color={theme.text4} lineHeight="24.38px" fontWeight={400}>
                {t('governance') + ' /'}
              </TYPE.mediumHeader>
              &nbsp;
              <CurrencyLogo size="20px" currency={USDC} />
              <CurrencyLogo size="20px" currency={ETHER} />
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
        <LightCard padding="25px 20px">
          <AutoColumn gap="md">
            <Flex>
              <CurrencyLogo size="20px" currency={USDC} />
              <CurrencyLogo size="20px" currency={ETHER} />
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
              <InfoText>Total Liquidity:</InfoText>
              <InfoText>$146,787</InfoText>
            </RowBetween>
            <RowBetween>
              <InfoText>Volume:</InfoText>
              <Flex alignItems="center">
                <InfoText marginRight="8px">199.976</InfoText>
                <CurrencyLogo currency={USDC} size="20px" />
              </Flex>
            </RowBetween>
            <RowBetween>
              <InfoText>Pool fees:</InfoText>
              <InfoText>0.05%</InfoText>
            </RowBetween>
            <RowBetween>
              <InfoText>Your DAO power:</InfoText>
              <InfoText>0.4%</InfoText>
            </RowBetween>
          </AutoColumn>
        </LightCard>
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
              render: () => <></>
            }
          ]}
        />
      </AutoColumn>
    </PageWrapper>
  )
}
