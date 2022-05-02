import React from 'react'

import { CurrencyAmount, Percent, Token } from '@swapr/sdk'
import { TYPE } from '../../../../theme'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import styled from 'styled-components'
import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { formatCurrencyAmount } from '../../../../utils'

import { unwrappedToken } from '../../../../utils/wrappedCurrency'

import { Flex, Text } from 'rebass'
import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import CurrencyLogo from '../../../CurrencyLogo'
import CarrotBadge from '../../../Badge/Carrot'
import { useTranslation } from 'react-i18next'

const SizedCard = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  border-top: 1px solid ${props => props.theme.bg3};
  padding: 22px;
`

const FarmingBadge = styled.div<{ isGreyed?: boolean }>`
  height: 16px;
  border: solid 1px;
  border-color: ${props => (props.isGreyed ? `transparent` : `${props.theme.green2}`)};
  div {
    color: ${props => (props.isGreyed ? props.theme.purple2 : props.theme.green2)};
  }
  border-radius: 6px;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 2px;
  background-color: ${props => props.isGreyed && props.theme.bg3};
  opacity: ${props => props.isGreyed && '0.5'};
  gap: 4px;
  svg {
    > path {
      fill: ${props => (props.isGreyed ? props.theme.purple2 : props.theme.green2)};
    }
  }
  font-weight: 700;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.02em;
`

const BadgeText = styled.div`
  font-weight: 700;
  font-size: 9px;
  line-height: 9px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`

const EllipsizedText = styled(TYPE.body)`
  overflow: hidden;
  text-overflow: ellipsis;
`
const ValueText = styled.div`
  color: ${props => props.theme.purple2};
  font-size: 14px;
  font-weight: 500;
  line-height: 16.8px;
  font-family: 'Fira Code';
`
const ItemsWrapper = styled(Flex)`
  justify-content: space-evenly;
  flex-direction: column;
`

interface PairProps {
  token0?: Token
  token1?: Token
  apy: Percent
  usdLiquidity: CurrencyAmount
  pairOrStakeAddress?: string
  containsKpiToken?: boolean
  hasFarming?: boolean
  isSingleSidedStakingCampaign?: boolean
  dayLiquidity?: string
}

export default function Pair({
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
    <SizedCard {...rest}>
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
    </SizedCard>
  )
}
