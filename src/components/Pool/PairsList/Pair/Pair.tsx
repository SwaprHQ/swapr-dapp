import { CurrencyAmount, Percent, Token } from '@swapr/sdk'

import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass/styled-components'
import styled from 'styled-components'

import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'
import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
import { TYPE } from '../../../../theme'
import { formatCurrencyAmount } from '../../../../utils'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'
import CarrotBadge from '../../../Badge/Carrot'
import { CurrencyLogo } from '../../../CurrencyLogo'
import DoubleCurrencyLogo from '../../../DoubleLogo'
import { ValueWithLabel } from '../../PairView/ValueWithLabel'

export interface PairProps {
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
  const { t } = useTranslation('pool')
  const isMobile = useIsMobileByMedia()

  return (
    <GridCard {...rest} data-testid="pair-card" flexWrap="wrap" justifyContent="space-between">
      <FlexWrapper>
        {isSingleSidedStakingCampaign ? (
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
        )}
        <Flex flexDirection="column">
          <EllipsizedText color="white" lineHeight="20px" fontWeight="700" fontSize="16px" maxWidth="145px">
            {unwrappedToken(token0)?.symbol}
            {!isSingleSidedStakingCampaign && `/${unwrappedToken(token1)?.symbol}`}
          </EllipsizedText>
        </Flex>
      </FlexWrapper>
      <FlexWrapper>
        <Flex style={{ gap: '6px' }} flexDirection="row" alignItems="flex-start" flexWrap="wrap">
          <FarmingBadge isGreyed={!hasFarming}>
            <FarmingLogo />
            <BadgeText>{t('pairsList.farming')}</BadgeText>
          </FarmingBadge>
          <CarrotBadge isGreyed={!containsKpiToken} />
        </Flex>
      </FlexWrapper>
      <FlexValueWithLabelsWrapper>
        <Flex40>
          <ValueWithLabel
            labelDesktop={false}
            title="TVL"
            value={`$${formatCurrencyAmount(usdLiquidity).split('.')[0]}`}
          />
        </Flex40>
        <Flex40>
          <ValueWithLabel
            labelDesktop={false}
            title="24h Volume"
            value={`$${
              !loading && volume24hUSD
                ? formatCurrencyAmount(volume24hUSD).split('.')[0]
                : dayLiquidity
                ? dayLiquidity
                : '0'
            }`}
          />
        </Flex40>
        <Flex alignItems="center">
          <ValueWithLabel labelDesktop={false} title="APY" value={`${apy.toFixed(0)}%`} big />
        </Flex>
      </FlexValueWithLabelsWrapper>
    </GridCard>
  )
}

const Flex40 = styled(Flex)`
  width: 40%;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}
`

const FlexWrapper = styled(Flex)`
  width: 25%;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}
`

const FlexValueWithLabelsWrapper = styled(Flex)`
  width: 45%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: space-between;
    width: 100%;
  `};
`

const GridCard = styled(Flex)`
  row-gap: 24px;
  padding: 22px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 22px 10px
  `};
`

const FarmingBadge = styled.div<{ isGreyed?: boolean }>`
  height: 16px;
  border: solid 1px;
  border-color: ${({ isGreyed, theme }) => (isGreyed ? `transparent` : `${theme.green2}`)};
  div {
    color: ${({ isGreyed, theme }) => (isGreyed ? theme.purple2 : theme.green2)};
  }
  border-radius: 6px;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 2px;
  background-color: ${({ isGreyed, theme }) => isGreyed && theme.bg3};
  opacity: ${({ isGreyed }) => isGreyed && '0.5'};
  gap: 4px;
  svg {
    > path {
      fill: ${({ isGreyed, theme }) => (isGreyed ? theme.purple2 : theme.green2)};
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

const EllipsizedText = styled(TYPE.Body)`
  overflow: hidden;
  text-overflow: ellipsis;
`
