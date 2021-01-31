import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Flex, Text } from 'rebass'

import { TYPE } from '../../theme'

import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ETHER } from 'dxswap-sdk'
import { USDC } from '../../constants'
import { GradientButton } from './styleds'
import MyLiquidity from './MyLiquidity'

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

const ContentTitle = styled(TYPE.main)`
  font-size: 14px;
  font-weight: 500;
  line-height: 17px;
  color: ${({ theme }) => theme.purple2};
`

export default function Container() {
  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap="lg" style={{ width: '100%' }}>
      <ContentCard>
        <AutoColumn gap="md">
          <Flex marginBottom="14px" justifyContent="space-between" alignItems="center">
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
                USDC/ETH
              </TYPE.mediumHeader>
            </Flex>
            <GradientButton>
              <Text fontWeight={700} fontSize={12}>
                STATS
              </Text>
              <span style={{ fontSize: '11px', marginLeft: '4px' }}>↗</span>
            </GradientButton>
          </Flex>
          <RowBetween>
            <ContentTitle>Total Liquidity:</ContentTitle>
            <ContentTitle>$146,787</ContentTitle>
          </RowBetween>
          <RowBetween>
            <ContentTitle>Volume:</ContentTitle>
            <Flex alignItems="center">
              <ContentTitle marginRight="8px">199.976</ContentTitle>
              <CurrencyLogo currency={USDC} size="20px" />
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
          <RowBetween>
            <MyLiquidity />
          </RowBetween>
          <RowBetween>
            <GradientButton width="100% !important" marginTop="14px">
              <TYPE.main color={theme.text4} fontWeight={'bold'} fontSize={'12px'} lineHeight={'15px'}>
                GOVERNANCE
              </TYPE.main>
              <div
                style={{
                  borderRadius: '50px',
                  backgroundColor: theme.mainPurple,
                  width: '16px',
                  height: '16px'
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: theme.text1,
                    lineHeight: '16px'
                  }}
                >
                  3
                </span>
              </div>
            </GradientButton>
          </RowBetween>
        </AutoColumn>
      </ContentCard>
    </AutoColumn>
  )
}
