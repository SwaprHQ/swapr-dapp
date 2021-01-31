import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Flex } from 'rebass'
import { ETHER } from 'dxswap-sdk'
import { USDC } from '../../constants'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { GradientButton, ContentCard, ContentTitle } from './styleds'

export default function MyLiquidity() {
  const theme = useContext(ThemeContext)

  return (
    <ContentCard style={{ background: 'rgba(20, 19, 29, 0.55)' }}>
      <AutoColumn gap="9px">
        <TYPE.mediumHeader color={theme.white} fontWeight={600} lineHeight="19.5px" fontSize="16px" marginBottom="11px">
          Your Liquidity
        </TYPE.mediumHeader>
        <RowBetween>
          <ContentTitle>LP-Tokens:</ContentTitle>
          <ContentTitle>13.321</ContentTitle>
        </RowBetween>
        <RowBetween>
          <ContentTitle>Pooled USDC:</ContentTitle>
          <Flex alignItems="center">
            <ContentTitle marginRight="8px">199.976</ContentTitle>
            <CurrencyLogo currency={USDC} size="20px" />
          </Flex>
        </RowBetween>
        <RowBetween>
          <ContentTitle>Pooled ETH:</ContentTitle>
          <Flex alignItems="center">
            <ContentTitle marginRight="8px">0.578568</ContentTitle>
            <CurrencyLogo currency={ETHER} size="20px" />
          </Flex>
        </RowBetween>
        <RowBetween>
          <ContentTitle>Your pool share:</ContentTitle>
          <ContentTitle>0.00%</ContentTitle>
        </RowBetween>
        <RowBetween>
          <ContentTitle>Your pool Rewards:</ContentTitle>
          <ContentTitle>0.05%</ContentTitle>
        </RowBetween>
        <RowBetween>
          <ContentTitle>Voting Power:</ContentTitle>
          <ContentTitle>0.15%</ContentTitle>
        </RowBetween>
        <RowBetween>
          <GradientButton style={{ margin: '0 4px', width: '100%' }}>
            <TYPE.main color={theme.text4} fontWeight={'bold'} fontSize={'12px'} lineHeight={'15px'}>
              ADD LIQUIDITY
            </TYPE.main>
          </GradientButton>
          <GradientButton style={{ margin: '0 4px', width: '100%' }}>
            <TYPE.main color={theme.text4} fontWeight={'bold'} fontSize={'12px'} lineHeight={'15px'}>
              REMOVE LIQUIDITY
            </TYPE.main>
          </GradientButton>
        </RowBetween>
      </AutoColumn>
    </ContentCard>
  )
}
