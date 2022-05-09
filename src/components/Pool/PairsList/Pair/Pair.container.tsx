import React from 'react'

import DoubleCurrencyLogo from '../../../DoubleLogo'
import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { formatCurrencyAmount } from '../../../../utils'

import { unwrappedToken } from '../../../../utils/wrappedCurrency'

import { Flex, Text } from 'rebass'
import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import CurrencyLogo from '../../../CurrencyLogo'
import CarrotBadge from '../../../Badge/Carrot'
import { useTranslation } from 'react-i18next'
import { PairProps } from './Pair.types'
import { EllipsizedText, FarmingBadge, GridCard, BadgeText, ItemsWrapper, ValueText } from './Pari.styles'

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

  return (
    <GridCard {...rest}>
      <Flex flexDirection="row" alignItems="center">
        {isSingleSidedStakingCampaign ? (
          <CurrencyLogo size="45px" marginRight={14} currency={token0} />
        ) : (
          <DoubleCurrencyLogo
            spaceBetween={0}
            marginLeft={0}
            marginRight={14}
            top={0}
            currency0={token0}
            currency1={token1}
            size={45}
          />
        )}
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
        <ValueText> ${formatCurrencyAmount(usdLiquidity).split('.')[0]}</ValueText>
      </ItemsWrapper>
      <ItemsWrapper>
        <ValueText>
          ${!loading && volume24hUSD ? formatCurrencyAmount(volume24hUSD).split('.')[0] : dayLiquidity}
          {dayLiquidity && dayLiquidity}
        </ValueText>
      </ItemsWrapper>
      <ItemsWrapper>
        <Text fontWeight="700" fontSize="18px" fontFamily="Fira Code">
          {apy.toFixed(0)}%
        </Text>
      </ItemsWrapper>
    </GridCard>
  )
}
