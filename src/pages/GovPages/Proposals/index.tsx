import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Info } from 'react-feather'
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
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    
  `};
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
        <LightCard>
          <AutoColumn gap="md">
            <Flex>
              <Info color={theme.text4} size={18} />
              <TYPE.body marginLeft="10px" color={'text4'} fontWeight={500} lineHeight="20px">
                Swapr Governance
              </TYPE.body>
            </Flex>
            <RowBetween>
              <TYPE.body fontWeight="500" fontSize="11px" lineHeight="16px" letterSpacing="-0.4px">
                SWP-LP tokens represent voting shares in Swapr governance. You can vote on each proposal yourself or
                delegate your votes to a third party.
              </TYPE.body>
            </RowBetween>
            <RowBetween>
              <TYPE.body
                as="a"
                color={'text4'}
                fontSize="17px"
                lineHeight="17px"
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Read more about Swapr Governance
              </TYPE.body>
            </RowBetween>
          </AutoColumn>
        </LightCard>
        <LightCard>
          <AutoColumn gap="md">
            <Flex>
              <Info color={theme.text4} size={18} />
              <TYPE.body marginLeft="10px" color={'text4'} fontWeight={500} lineHeight="20px">
                Swapr Governance
              </TYPE.body>
            </Flex>
            <RowBetween>
              <TYPE.body fontWeight="500" fontSize="11px" lineHeight="16px" letterSpacing="-0.4px">
                SWP-LP tokens represent voting shares in Swapr governance. You can vote on each proposal yourself or
                delegate your votes to a third party.
              </TYPE.body>
            </RowBetween>
            <RowBetween>
              <TYPE.body
                as="a"
                color={'text4'}
                fontSize="17px"
                lineHeight="17px"
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Read more about Swapr Governance
              </TYPE.body>
            </RowBetween>
          </AutoColumn>
        </LightCard>
      </AutoColumn>
    </PageWrapper>
  )
}
