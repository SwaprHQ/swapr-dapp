import { CurrencyAmount, Percent, Token } from '@swapr/sdk'

import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as FarmingLogo } from '../../../../assets/svg/farming.svg'
import { useIsMobileByMedia } from '../../../../hooks/useIsMobileByMedia'
import { usePair24hVolumeUSD } from '../../../../hooks/usePairVolume24hUSD'
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
  const { t } = useTranslation()
  const isMobile = useIsMobileByMedia()

  return (
    <div
      className="flex flex-wrap justify-between py-6 px-0 md:p-6 space-y-5 md:space-y-0"
      data-testid="pair-card"
      {...rest}
    >
      <div className="flex items-center w-full md:w-1/4">
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
        <p className="text-lg text-white font-bold max-w-[145px] text-ellipsis overflow-hidden">
          {unwrappedToken(token0)?.symbol}
          {!isSingleSidedStakingCampaign && `/${unwrappedToken(token1)?.symbol}`}
        </p>
      </div>
      <div className="flex items-center w-full md:w-1/4  space-x-2">
        <div
          className={classNames(
            'border border-solid h-[16px] px-1 rounded flex items-center justify-center w-fit gap-1',
            {
              'border-green-300': hasFarming,
              'border-transparent	': !hasFarming,
              'opacity-50': !hasFarming,
              'bg-gray-700': !hasFarming,
            }
          )}
        >
          <FarmingLogo />
          <p
            className={classNames('font-bold text-2xs uppercase tracking-wide', {
              'text-green-300': hasFarming,
              'text-purple2': !hasFarming,
            })}
          >
            {t('farming')}
          </p>
        </div>
        <CarrotBadge isGreyed={!containsKpiToken} />
      </div>
      <div className="flex items-center justify-between w-full md:w-[45%]">
        <ValueWithLabel
          labelDesktop={false}
          title="TVL"
          value={`$${formatCurrencyAmount(usdLiquidity).split('.')[0]}`}
        />
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
        <div className="flex items-center">
          <ValueWithLabel labelDesktop={false} title="APY" value={`${apy.toFixed(0)}%`} big />
        </div>
      </div>
    </div>
  )
}
