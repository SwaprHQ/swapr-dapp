import React from 'react'
import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'
import { Flex } from 'rebass/styled-components'

import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { formatCurrencyAmount } from '../../../../utils'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'

import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { CurrencyLogo } from '../../../CurrencyLogo'
import CarrotBadge from '../../../Badge/Carrot'
import { useTranslation } from 'react-i18next'
import { PairProps } from './Pair.types'
import { EllipsizedText, FarmingBadge, GridCard, BadgeText } from './Pair.styles'
import { useTheme } from 'styled-components'
import { ResponsiveValueWithLabel } from './Pair.components'

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
  const theme = useTheme()
  const isMobile = useIsMobileByMedia()

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

  return (
    <GridCard
      {...rest}
      data-testid="pair-card"
      flexWrap="wrap"
      justifyContent="space-between"
      padding={isMobile ? '22px 10px' : '22px'}
    >
      <Flex flex={isMobile ? '' : '25%'} flexDirection="row" alignItems="center">
        {correctLogo()}
        <Flex flexDirection="column">
          <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="145px">
            {unwrappedToken(token0)?.symbol}
          </EllipsizedText>
          <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="145px">
            {!isSingleSidedStakingCampaign && unwrappedToken(token1)?.symbol}
          </EllipsizedText>
        </Flex>
      </Flex>
      <Flex flex={isMobile ? '' : '25%'} flexDirection="column" alignItems="flex-start" justifyContent="space-evenly">
        <Flex style={{ gap: '6px' }} flexDirection="row" alignItems="flex-start" flexWrap="wrap">
          <FarmingBadge isGreyed={!hasFarming}>
            <FarmingLogo />
            <BadgeText>{t('farming')}</BadgeText>
          </FarmingBadge>
          <CarrotBadge isGreyed={!containsKpiToken} />
        </Flex>
      </Flex>
      <Flex flex={isMobile ? '100%' : '45%'} justifyContent="space-between">
        <Flex alignItems="center" flex={isMobile ? '' : '30%'}>
          <ResponsiveValueWithLabel title="TVL" value={`$${formatCurrencyAmount(usdLiquidity).split('.')[0]}`} />
        </Flex>
        <Flex alignItems="center" flex={isMobile ? '' : '30%'}>
          <ResponsiveValueWithLabel
            title="24h Volume"
            value={`$${
              !loading && volume24hUSD
                ? formatCurrencyAmount(volume24hUSD).split('.')[0]
                : dayLiquidity
                ? dayLiquidity
                : '-'
            }`}
          />
        </Flex>
        <Flex alignItems="center" flex={isMobile ? '' : '10%'}>
          <ResponsiveValueWithLabel title="APY" value={`${apy.toFixed(0)}%`} fontSize="18px" color={theme.white} big />
        </Flex>
      </Flex>
    </GridCard>
  )
}
