import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Flex, Text } from 'rebass'
import { ETHER } from 'dxswap-sdk'
import { USDC } from '../../constants'

import { TYPE } from '../../theme'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import MyLiquidity from './MyLiquidity'
import { GradientButton, ContentCard, ContentTitle } from './styleds'

export default function Container() {
  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap="lg" style={{ width: '100%' }}>
      <ContentCard>
        <AutoColumn gap="10px">
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
            <GradientButton style={{ width: '102px' }}>
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
