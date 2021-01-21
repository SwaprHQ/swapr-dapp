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
import Proposals from './Proposals'

// import { Redirect } from 'react-router-dom'

const ContentCard = styled(LightCard)`
  background: linear-gradient(113.18deg, rgba(255, 255, 255, 0.35) -0.1%, rgba(0, 0, 0, 0) 98.9%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay, normal;
  border-radius: 8px;
  padding: 25px 20px;
  position: relative;
  border: none;

  ::before {
    content: '';
    background-image: linear-gradient(180deg, ${({ theme }) => theme.bg1} 0%, ${({ theme }) => theme.bg3} 100%);
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    position: absolute;
    z-index: -1;
    border-radius: 8px;
  }
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;    
  `};
`

const ContentTitle = styled(TYPE.main)`
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
  padding: 9px 21px;
  background: linear-gradient(141.72deg, rgba(255, 255, 255, 0.55) -11.46%, rgba(0, 0, 0, 0) 155.17%),
    ${({ theme }) => theme.dark1};
  background-blend-mode: overlay;
  border: 1px solid #28263f;
`

export default function GovernanceProposals() {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const router = useRouter()
  const pairName = t(router.query.asset) + '/' + t(router.query.pair)
  const currency = router.location.state?.currency
  const currency1 = router.location.state?.currency1

  // if (currency === undefined || currency1 === undefined) {
  //   return <Redirect to="/" />
  // }

  return (
    <PageWrapper>
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow marginBottom="1rem" padding="0">
            <Flex alignItems="center">
              <a href="#/governance">
                <TYPE.mediumHeader color={theme.text4} lineHeight="24.38px" fontWeight={400}>
                  {t('governance') + ' /'}
                </TYPE.mediumHeader>
              </a>
              &nbsp;
              <CurrencyLogo size="20px" currency={currency} />
              <CurrencyLogo size="20px" currency={currency1} />
              &nbsp;
              <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal">
                {pairName}
              </TYPE.mediumHeader>
            </Flex>
            <Flex>
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
            <Flex marginBottom="14px" justifyContent="space-between" alignItems="center">
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
              <ResponsiveButtonSecondary>
                <Text fontWeight={700} fontSize={12}>
                  {pairName + ' STATS'}
                </Text>
                <span style={{ fontSize: '11px', marginLeft: '4px' }}>↗</span>
              </ResponsiveButtonSecondary>
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
              render: Proposals
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
