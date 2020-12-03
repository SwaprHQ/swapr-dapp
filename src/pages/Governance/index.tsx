import React from 'react'
import styled from 'styled-components'

import { Text } from 'rebass'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'

import { GovernanceCard } from '../../components/GovernanceCard'
import { HideSmall } from '../../theme'

import imgTokenDAI from '../../assets/images/tokens/token-dai.png'
import imgTokenDMG from '../../assets/images/tokens/token-dmg.png'
import imgTokenRARI from '../../assets/images/tokens/token-rari.png'
import imgTokenSNT from '../../assets/images/tokens/token-snt.png'
import imgTokenUSDC from '../../assets/images/tokens/token-usdc.png'
import imgTokenUSDT from '../../assets/images/tokens/token-usdt.png'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const GridColumn = styled(AutoColumn)`
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 7.75px;
  margin-top: 7.75px;
`

const SwaperGovernance = styled(Column)`
  padding: 20px;
  color: #8780bf;
  background: #14131d;
  border: 1px solid #26243b;
  border-radius: 8px;
  margin-top: 32px;
`

const CustomButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  font-weight: 700;
  font-size: 12px;
  height: 32px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: #2e17f2;
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const CustomButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  font-weight: 700;
  font-size: 12px;
  height: 32px;
  color: #c0baf7;
  border: 1px solid #7873a4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  `};
`

const StatisticsButton = styled(CustomButtonSecondary)`
  height: 34px;
  width: 100% !important;
  display: flex;
  margin-top: 30px;
`

export default function Governance() {
  return (
    <>
      <PageWrapper>
        <RowBetween style={{ marginBottom: 30 }}>
          <HideSmall>
            <Text fontWeight={500} fontSize={20}>
              Governance
            </Text>
          </HideSmall>

          <ButtonRow>
            <CustomButtonSecondary padding="7px 14px">Your Proposals</CustomButtonSecondary>
            <CustomButtonPrimary padding="7px 14px" style={{ marginLeft: 8 }}>
              Create Governance
            </CustomButtonPrimary>
          </ButtonRow>
        </RowBetween>

        <Column>
          <GovernanceCard image={imgTokenUSDC} pairCount={4} proposalCount={32} description="DXD" />

          <GridColumn>
            <GovernanceCard pairCount={15} proposalCount={1} description="USDC" image={imgTokenUSDC} />
            <GovernanceCard pairCount={5} proposalCount={0} description="DAI" image={imgTokenDAI} />
            <GovernanceCard pairCount={5} proposalCount={3} description="DMG" image={imgTokenDMG} />
            <GovernanceCard pairCount={1} proposalCount={0} description="SNT" image={imgTokenSNT} />
            <GovernanceCard pairCount={5} proposalCount={0} description="RARI" image={imgTokenRARI} />
            <GovernanceCard pairCount={22} proposalCount={0} description="USDT" image={imgTokenUSDT} />
          </GridColumn>
        </Column>

        <StatisticsButton>
          <Text>Governance statistics</Text>
          <Text style={{ marginLeft: 8, paddingTop: 4 }}>↗</Text>
        </StatisticsButton>

        <SwaperGovernance>
          <Text fontSize={16} fontWeight={600} style={{ lineHeight: '20px', marginBottom: 14 }}>
            Swaper Governance
          </Text>
          <Text fontSize={12} fontWeight={500} style={{ letterSpacing: -0.4, lineHeight: '15px', marginBottom: 14 }}>
            SWP-LP tokens represent voting shares in Swapr governance. You can vote on each proposal yourself or
            delegate your votes to a third party.
          </Text>
          <Text
            fontSize={14}
            fontWeight={500}
            style={{ textDecoration: 'underline', lineHeight: '17px', cursor: 'pointer' }}
          >
            Read more about Swapr Governance
          </Text>
        </SwaperGovernance>
      </PageWrapper>
    </>
  )
}
