import React, { useState } from 'react'
import styled from 'styled-components'

import { Text } from 'rebass'
import { Row, RowBetween, RowFixed, AutoRow } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'

import { GovernanceCard } from '../../components/GovernanceCard'
import { GovernancePairCard } from '../../components/GovernancePairCard'
import { HideSmall } from '../../theme'

import imgTokenDAI from '../../assets/images/tokens/token-dai.png'
import imgTokenDMG from '../../assets/images/tokens/token-dmg.png'
import imgTokenRARI from '../../assets/images/tokens/token-rari.png'
import imgTokenSNT from '../../assets/images/tokens/token-snt.png'
import imgTokenUSDC from '../../assets/images/tokens/token-usdc.png'
import imgTokenUSDT from '../../assets/images/tokens/token-usdt.png'
import imgTick from '../../assets/images/tick.png'
import imgAccessTime from '../../assets/images/access_time.png'
import imgBlock from '../../assets/images/block.png'
import imgHourGlass from '../../assets/images/hourglass.png'

import { Pagination } from '../../components/Pagination'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const ProposalDetails = styled(AutoColumn)`
  padding: 24px 20px;
  width: 100%;
  background: rgba(16, 16, 22, 0.72);
  border-radius: 8px;
`

const ProposalWrapper = styled(AutoColumn)`
  width: 100%;
  margin-bottom: 8px;
  padding: 16px 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  border-color: ${(prop: { type?: string }) =>
    prop.type === 'passed' ? '#27AE60' : prop.type === 'failed' ? '#F02E51' : 'transparent'};
  background: ${(prop: { type?: string }) =>
    prop.type === 'passed'
      ? 'rgba(39, 174, 96, 0.05);'
      : prop.type === 'failed'
      ? 'rgba(240, 46, 81, 0.05)'
      : 'rgba(16, 16, 22, 0.72)'};
`

const ProposalBage = styled.div`
  padding: 2px 6px;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  text-transform: uppercase;
  text-align: center;

  border-color: ${(prop: { type?: string }) =>
    prop.type === 'passed' ? '#27AE60' : prop.type === 'failed' ? '#F02E51' : '#8780BF'};
  color: ${(prop: { type?: string }) =>
    prop.type === 'passed' ? '#27AE60' : prop.type === 'failed' ? '#F02E51' : '#8780BF'};

  ${(prop: { type?: string; filled?: boolean }) =>
    prop.filled &&
    `
    background: ${prop.type === 'passed' ? '#27AE60' : prop.type === 'failed' ? '#F02E51' : 'transparent'};
    color: ${prop.type === 'passed' ? '#14131D' : prop.type === 'failed' ? '#ffffff' : '#8780BF'};
    font-weight: 600;
    font-size: 9px;
    line-height: 11px;
    letter-spacing: 0.04em;
  `}
`

const GridColumn = styled(AutoColumn)`
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 8px;
  margin-top: 8px;
`

const Swapr = styled(Column)`
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

const TokenIconSM = styled.img`
  width: 20px;
  height: 20px;
`

const NavigationItem = styled.div`
  font-weight: 600;
  padding: 10px 0;
  font-size: 18px;
  line-height: 22px;
  cursor: pointer;
  color: ${(props: { active?: boolean }) => (props.active ? '#C0BAF6' : '#8780BF')};

  border-bottom: ${(props: { active?: boolean }) => (props.active ? '2px solid #8780BF' : 'none')};
`

export default function Governance() {
  const pairs = [
    { title: 'DXD', pairCount: 4, proposalCount: 32, image: imgTokenUSDC },
    { title: 'USDC', pairCount: 15, proposalCount: 1, image: imgTokenUSDC },
    { title: 'DAI', pairCount: 5, proposalCount: 0, image: imgTokenDAI },
    { title: 'DMG', pairCount: 5, proposalCount: 3, image: imgTokenDMG },
    { title: 'SNT', pairCount: 1, proposalCount: 0, image: imgTokenSNT },
    { title: 'RARI', pairCount: 5, proposalCount: 0, image: imgTokenRARI },
    { title: 'USDT', pairCount: 22, proposalCount: 0, image: imgTokenUSDT },
    { title: 'DAI', pairCount: 5, proposalCount: 0, image: imgTokenDAI }
  ]
  const [route, setRoute] = useState('')

  return (
    <>
      <PageWrapper>
        <RowBetween style={{ marginBottom: 30 }}>
          {route === '' && (
            <HideSmall>
              <Text fontWeight={500} fontSize={20} style={{ color: '#C0BAF6' }}>
                Governance
              </Text>
            </HideSmall>
          )}

          {route === 'pairs' && (
            <Row style={{ width: 'initial' }}>
              <HideSmall>
                <Text fontWeight={500} fontSize={20} style={{ color: '#C0BAF6' }}>
                  Governance /
                </Text>
              </HideSmall>

              <TokenIconSM src={imgTokenUSDC} style={{ marginLeft: 6 }} />

              <Text fontWeight={600} fontSize={16} style={{ marginLeft: 6 }}>
                USDC
              </Text>
            </Row>
          )}

          {route === 'pairs-details' && (
            <Row style={{ width: 'initial' }}>
              <HideSmall>
                <Text fontWeight={500} fontSize={20} style={{ color: '#C0BAF6' }}>
                  Governance /
                </Text>
              </HideSmall>

              <TokenIconSM src={imgTokenUSDC} style={{ marginLeft: 6 }} />
              <TokenIconSM src={imgTokenUSDC} />

              <Text fontWeight={600} fontSize={16} style={{ marginLeft: 6 }}>
                USDC/ETH
              </Text>
            </Row>
          )}

          <ButtonRow>
            <CustomButtonSecondary padding="7px 14px">
              {route === 'pairs-details' ? 'USDC/ETH STATS' : 'Your Proposals'}
            </CustomButtonSecondary>
            <CustomButtonPrimary padding="7px 14px" style={{ marginLeft: 8 }}>
              Create Proposal
            </CustomButtonPrimary>
          </ButtonRow>
        </RowBetween>

        {route === '' && (
          <Column>
            <GridColumn>
              {pairs.map(it => {
                return (
                  <GovernanceCard
                    pairCount={it.pairCount}
                    proposalCount={it.proposalCount}
                    description={it.title}
                    image={it.image}
                    onClick={() => setRoute('pairs')}
                  />
                )
              })}
            </GridColumn>
          </Column>
        )}

        {route === 'pairs' && (
          <Column>
            <GridColumn>
              {[...pairs, ...pairs].map(it => {
                return (
                  <GovernancePairCard
                    pairCount={it.pairCount}
                    proposalCount={it.proposalCount}
                    description={it.title}
                    image={it.image}
                    onClick={() => setRoute('pairs-details')}
                  />
                )
              })}
            </GridColumn>
          </Column>
        )}

        {route === 'pairs' && (
          <AutoRow justify={'flex-end'} style={{ marginTop: 30 }}>
            <Pagination length={3} />
          </AutoRow>
        )}

        {route === '' && (
          <StatisticsButton>
            <Text>Governance statistics</Text>
            <Text style={{ marginLeft: 8, paddingTop: 4 }}>↗</Text>
          </StatisticsButton>
        )}

        {route === 'pairs-details' ? (
          <AutoColumn>
            <ProposalDetails>
              <Row style={{ width: 'initial' }}>
                <TokenIconSM src={imgTokenUSDC} />
                <TokenIconSM src={imgTokenUSDC} />

                <Text fontWeight={600} fontSize={16} style={{ marginLeft: 6 }}>
                  USDC/ETH
                </Text>
              </Row>

              <RowBetween style={{ marginTop: 26 }}>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  Total Liquidity:
                </Text>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  $146,787
                </Text>
              </RowBetween>

              <RowBetween style={{ marginTop: 10 }}>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  Volume
                </Text>
                <AutoRow justify={'flex-end'}>
                  <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                    199.976
                  </Text>
                  <TokenIconSM src={imgTokenUSDC} style={{ marginLeft: 8 }} />
                </AutoRow>
              </RowBetween>

              <RowBetween style={{ marginTop: 10 }}>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  Pool fees:
                </Text>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  0.05%
                </Text>
              </RowBetween>

              <RowBetween style={{ marginTop: 10, marginBottom: 8 }}>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  Your DAO power:
                </Text>
                <Text color="#C0BAF6" fontSize="14px" fontWeight={500}>
                  0.4%
                </Text>
              </RowBetween>
            </ProposalDetails>

            <Row style={{ marginTop: 30, marginBottom: 24 }}>
              <NavigationItem active>Proposals</NavigationItem>
              <NavigationItem style={{ marginLeft: 36 }}>Proposals history</NavigationItem>
            </Row>

            <ProposalWrapper type="passed">
              <RowBetween>
                <Column>
                  <Row>
                    <ProposalBage type="passed">#001 passed</ProposalBage>
                    <img src={imgAccessTime} style={{ marginLeft: 10, marginRight: 4 }} />
                    <Text color="#8780BF" fontSize="9px" lineHeight="11px" fontWeight={600}>
                      23h ago &nbsp;&nbsp;|&nbsp;&nbsp; 45 Voted
                    </Text>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <img src={imgTick} style={{ marginRight: 8 }} />
                    <Text fontSize="16px" lineHeight="19.5px" fontWeight={600}>
                      USDC/ETH Pool Fee to 0.09%
                    </Text>
                  </Row>
                </Column>

                <Column>
                  <ProposalBage type="passed" filled={true}>
                    86% | PassED
                  </ProposalBage>
                  <ProposalBage style={{ marginTop: 8 }}>14% Fail</ProposalBage>
                </Column>
              </RowBetween>
            </ProposalWrapper>

            <ProposalWrapper type="failed">
              <RowBetween>
                <Column>
                  <Row>
                    <ProposalBage type="failed">#001 passed</ProposalBage>
                    <img src={imgAccessTime} style={{ marginLeft: 10, marginRight: 4 }} />
                    <Text color="#8780BF" fontSize="9px" lineHeight="11px" fontWeight={600}>
                      23h ago &nbsp;&nbsp;|&nbsp;&nbsp; 45 Voted
                    </Text>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <img src={imgBlock} style={{ marginRight: 8 }} />
                    <Text fontSize="16px" lineHeight="19.5px" fontWeight={600}>
                      USDC/ETH Pool Fee to 0.09%
                    </Text>
                  </Row>
                </Column>

                <Column>
                  <ProposalBage type="failed" filled={true}>
                    71% | Failed
                  </ProposalBage>
                  <ProposalBage style={{ marginTop: 8 }}>29% Pass</ProposalBage>
                </Column>
              </RowBetween>
            </ProposalWrapper>

            <ProposalWrapper>
              <RowBetween>
                <Column>
                  <Row>
                    <ProposalBage>#001 passed</ProposalBage>
                    <img src={imgHourGlass} style={{ marginLeft: 10, marginRight: 4 }} />
                    <Text color="#8780BF" fontSize="9px" lineHeight="11px" fontWeight={600}>
                      1d 23h 32m &nbsp;&nbsp;|&nbsp;&nbsp; 23 Voted
                    </Text>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <Text fontSize="16px" lineHeight="19.5px" fontWeight={600}>
                      USDC/ETH Pool Fee to 0.15%
                    </Text>
                  </Row>
                </Column>

                <Column>
                  <ProposalBage type="passed" filled={true}>
                    86% Pass
                  </ProposalBage>
                  <ProposalBage type="failed" style={{ marginTop: 8 }}>
                    29% Pass
                  </ProposalBage>
                </Column>
              </RowBetween>
            </ProposalWrapper>
            <AutoRow justify={'flex-end'} style={{ marginTop: 24 }}>
              <Pagination length={2} />
            </AutoRow>
          </AutoColumn>
        ) : (
          <Swapr>
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
          </Swapr>
        )}
      </PageWrapper>
    </>
  )
}
