import { JSBI, Pair, Percent, TokenAmount } from '@swapr/sdk'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useTotalSupply } from '../../../../data/TotalSupply'
import { useActiveWeb3React } from '../../../../hooks'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { getAccountAnalyticsLink } from '../../../../utils'
import { currencyId } from '../../../../utils/currencyId'
import { unwrappedToken } from '../../../../utils/wrappedCurrency'
import { ButtonExternalLink, ButtonPurpleDim } from '../../../Button'
import { DimBlurBgBox } from '../../DimBlurBgBox/styleds'
import { InfoGrid } from '../InfoGrid/InfoGrid.styles'
import { ValueWithLabel } from '../ValueWithLabel'

interface UserLiquidityProps {
  pair?: Pair
}

export function UserLiquidity({ pair }: UserLiquidityProps) {
  const { account, chainId } = useActiveWeb3React()
  const currency0 = unwrappedToken(pair?.token0)
  const currency1 = unwrappedToken(pair?.token1)
  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)
  const { t } = useTranslation()

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens
      ? totalPoolTokens.greaterThan('0') && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
        ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
        : new Percent('0', '100')
      : undefined

  const [token0Deposited, token1Deposited] = !!pair
    ? !!totalPoolTokens &&
      totalPoolTokens.greaterThan('0') &&
      !!userPoolBalance &&
      userPoolBalance.greaterThan('0') &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [new TokenAmount(pair.token0, '0'), new TokenAmount(pair.token1, '0')]
    : [undefined, undefined]

  return (
    <DimBlurBgBox padding>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="md:text-lg mb-4">{t('yourLiquidity')}</p>
        <div>
          <ButtonExternalLink link={getAccountAnalyticsLink(account || '', chainId)}>
            {t('accountAnalytics')}
          </ButtonExternalLink>
        </div>
      </div>
      <div className="my-6">
        <InfoGrid>
          <ValueWithLabel
            title={t('poolShare')}
            value={poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '0'}
          />
          <ValueWithLabel title={t('poolTokens')} value={userPoolBalance ? userPoolBalance.toSignificant(4) : '0'} />
          <ValueWithLabel
            title={t('pooledToken', { token: currency0?.symbol })}
            value={token0Deposited ? token0Deposited.toSignificant(6) : '0'}
          />
          <ValueWithLabel
            title={t('pooledToken', { token: currency1?.symbol })}
            value={token1Deposited ? token1Deposited.toSignificant(6) : '0'}
          />
        </InfoGrid>
      </div>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full mb-3 md:mb-0">
          <ButtonPurpleDim
            as={Link}
            to={currency0 && currency1 ? `/pools/add/${currencyId(currency0)}/${currencyId(currency1)}` : ''}
          >
            {t('addLiquidity')}
          </ButtonPurpleDim>
        </div>
        <div className="w-full md:ml-3">
          <ButtonPurpleDim
            disabled={token0Deposited?.equalTo('0')}
            as={token0Deposited?.equalTo('0') ? ButtonPurpleDim : Link}
            to={currency0 && currency1 ? `/pools/remove/${currencyId(currency0)}/${currencyId(currency1)}` : ''}
          >
            {t('removeLiquidity')}
          </ButtonPurpleDim>
        </div>
      </div>
    </DimBlurBgBox>
  )
}
