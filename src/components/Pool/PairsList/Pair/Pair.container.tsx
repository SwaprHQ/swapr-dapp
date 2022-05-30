import React, { useContext } from 'react'
import { isMobile } from 'react-device-detect'
import { Flex, Text } from 'rebass'

import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { formatCurrencyAmount } from '../../../../utils'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'

import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { CurrencyLogo } from '../../../CurrencyLogo'
import CarrotBadge from '../../../Badge/Carrot'
import { useTranslation } from 'react-i18next'
import { PairProps } from './Pair.types'
import { EllipsizedText, FarmingBadge, GridCard, BadgeText, ItemsWrapper, MobileBox } from './Pair.styles'
import { ThemeContext } from 'styled-components'
import { ValueWithLabel } from '../../PairView/ValueWithLabel/ValueWithLabel.component'

export function Pair({
  token0,
  token1,
  usdLiquidity,
  apy,
  containsKpiToken,
  pairOrStakeAddress,
  hasFarming,
  dayLiquidity,
  isSingleSidedStakingCampaign,
  ...rest
}: PairProps) {
  const { volume24hUSD, loading } = usePair24hVolumeUSD(pairOrStakeAddress, isSingleSidedStakingCampaign)
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  console.log('dayLiquidity:', dayLiquidity)

  const correctLogo = () =>
    isSingleSidedStakingCampaign ? (
      <CurrencyLogo size={isMobile ? '32px' : '45px'} marginRight={14} currency={token0} />
    ) : (
      <DoubleCurrencyLogo
        spaceBetween={0}
        marginLeft={0}
        marginRight={14}
        top={0}
        currency0={token0}
        currency1={token1}
        size={isMobile ? 32 : 45}
      />
    )

  return isMobile ? (
    <MobileBox>
      <Flex flexDirection="row" alignItems="center" justifyContent="space-between" paddingBottom={3}>
        <Flex>
          {correctLogo()}
          <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="145px">
            {unwrappedToken(token0)?.symbol}

            {!isSingleSidedStakingCampaign && <br></br>}

            {!isSingleSidedStakingCampaign && unwrappedToken(token1)?.symbol}
          </EllipsizedText>
        </Flex>
        <Flex flexDirection="column" alignItems="flex-start" justifyContent="space-evenly">
          <Flex style={{ gap: '6px' }} flexDirection="row" alignItems="flex-start" flexWrap="wrap">
            <FarmingBadge isGreyed={!hasFarming}>
              <FarmingLogo />
              <BadgeText>{t('farming')}</BadgeText>
            </FarmingBadge>
            <CarrotBadge isGreyed={!containsKpiToken} />
          </Flex>
        </Flex>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <ValueWithLabel value={usdLiquidity && `${formatCurrencyAmount(usdLiquidity).split('.')[0]}`} title="TVL" />
        <ValueWithLabel
          value={
            volume24hUSD ? `${formatCurrencyAmount(volume24hUSD).split('.')[0]}` : dayLiquidity ? dayLiquidity : '-'
          }
          title="24h volume"
        />
        <ValueWithLabel value={`${apy.toFixed(0)}%`} title="APY" />
      </Flex>
    </MobileBox>
  ) : (
    <GridCard {...rest} data-testid="pair-card">
      <Flex flexDirection="row" alignItems="center">
        {correctLogo()}
        <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="145px">
          {unwrappedToken(token0)?.symbol}

          {!isSingleSidedStakingCampaign && <br></br>}

          {!isSingleSidedStakingCampaign && unwrappedToken(token1)?.symbol}
        </EllipsizedText>
      </Flex>
      <Flex flexDirection="column" alignItems="flex-start" justifyContent="space-evenly">
        <Flex style={{ gap: '6px' }} flexDirection="row" alignItems="flex-start" flexWrap="wrap">
          <FarmingBadge isGreyed={!hasFarming}>
            <FarmingLogo />
            <BadgeText>{t('farming')}</BadgeText>
          </FarmingBadge>
          <CarrotBadge isGreyed={!containsKpiToken} />
        </Flex>
      </Flex>
      <ItemsWrapper>
        <Text fontWeight="500" fontSize="14px" color={theme.purple2}>
          ${formatCurrencyAmount(usdLiquidity).split('.')[0]}
        </Text>
      </ItemsWrapper>
      <ItemsWrapper>
        <Text fontWeight="500" fontSize="14px" color={theme.purple2}>
          ${!loading && volume24hUSD ? formatCurrencyAmount(volume24hUSD).split('.')[0] : dayLiquidity}
          {dayLiquidity && dayLiquidity}
        </Text>
      </ItemsWrapper>
      <ItemsWrapper>
        <Text fontWeight="500" fontSize="18px">
          {apy.toFixed(0)}%
        </Text>
      </ItemsWrapper>
    </GridCard>
  )
}
