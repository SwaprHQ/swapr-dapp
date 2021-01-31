import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import { Flex, Text } from 'rebass'

import { USDC } from '../../constants'
import { ETHER } from 'dxswap-sdk'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { TitleRow, ResponsiveButtonPrimary, GradientButton } from './styleds'

export default function Title() {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  return (
    <TitleRow>
      <Flex alignItems="center">
        <TYPE.mediumHeader color={theme.text4} lineHeight="24.38px" fontWeight={400}>
          {t('pool') + ' /'}
        </TYPE.mediumHeader>
        <CurrencyLogo size="20px" currency={USDC} style={{ marginLeft: '6px' }} />
        <CurrencyLogo size="20px" currency={ETHER} style={{ marginRight: '6px' }} />
        <TYPE.mediumHeader lineHeight="19.5px" fontWeight={600} fontSize="16px" fontStyle="normal">
          USDC/ETH
        </TYPE.mediumHeader>
      </Flex>
      <Flex>
        <GradientButton marginRight="8px" padding="8.5px 20px">
          <TYPE.main color={theme.text4} fontWeight={'bold'} fontSize={'12px'} lineHeight={'15px'}>
            CREATE A PAIR
          </TYPE.main>
        </GradientButton>
        <ResponsiveButtonPrimary id="create-proposal-button" padding="8px 14px">
          <Text fontWeight={700} fontSize={12}>
            CREATE PROPOSAL
          </Text>
        </ResponsiveButtonPrimary>
      </Flex>
    </TitleRow>
  )
}
