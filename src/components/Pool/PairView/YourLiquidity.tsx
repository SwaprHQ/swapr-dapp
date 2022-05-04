import { JSBI, Pair, Percent, TokenAmount } from '@swapr/sdk'
import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'

import { useTotalSupply } from '../../../data/TotalSupply'
import { useActiveWeb3React } from '../../../hooks'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { currencyId } from '../../../utils/currencyId'
import { unwrappedToken } from '../../../utils/wrappedCurrency'

import { ButtonExternalLink, ButtonPurpleDim } from '../../Button'
import { DimBlurBgBox } from '../DimBlurBgBox'
import { InfoSnippet } from './InfoSnippet'

interface YourLiquidityProps {
  pair?: Pair
}

export default function YourLiquidity({ pair }: YourLiquidityProps) {
  const { account, chainId } = useActiveWeb3React()
  const currency0 = unwrappedToken(pair?.token0)
  const currency1 = unwrappedToken(pair?.token1)
  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

  const accountAnalyticsLink = account
    ? `https://dxstats.eth.link/#/account/${account}?chainId=${chainId}`
    : `https://dxstats.eth.link/#/accounts?chainId=${chainId}`

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
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [new TokenAmount(pair.token0, '0'), new TokenAmount(pair.token1, '0')]
    : [undefined, undefined]

  return (
    <DimBlurBgBox padding={'24px'}>
      <Flex alignItems="center" justifyContent="space-between" paddingBottom={'24px'}>
        <Text fontSize="16px" mb="24px">
          Your liquidity
        </Text>
        <Box>
          <ButtonExternalLink link={accountAnalyticsLink}>Account analytics</ButtonExternalLink>
        </Box>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <InfoSnippet title="Pool share" value={poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'} />
        <InfoSnippet title="Pool tokens" value={userPoolBalance ? userPoolBalance.toSignificant(4) : '-'} />
        <InfoSnippet
          title={`Pooled ${currency0?.symbol}`}
          value={token0Deposited ? token0Deposited.toSignificant(6) : '-'}
        />
        <InfoSnippet
          title={`Pooled ${currency1?.symbol}`}
          value={token1Deposited ? token1Deposited.toSignificant(6) : '-'}
        />
        <InfoSnippet
          title="Swap fee"
          value={
            pair ? new Percent(JSBI.BigInt(pair.swapFee.toString()), JSBI.BigInt(10000)).toSignificant(3) + '%' : '-'
          }
        />
      </Flex>
      <Flex>
        <ButtonPurpleDim
          style={{ marginRight: '4px' }}
          as={Link}
          to={currency0 && currency1 ? `/add/${currencyId(currency0)}/${currencyId(currency1)}` : ''}
        >
          Add liquidity
        </ButtonPurpleDim>
        <ButtonPurpleDim
          style={{ marginLeft: '4px' }}
          as={Link}
          to={currency0 && currency1 ? `/remove/${currencyId(currency0)}/${currencyId(currency1)}` : ''}
        >
          Remove liquidity
        </ButtonPurpleDim>
      </Flex>
    </DimBlurBgBox>
  )
}
