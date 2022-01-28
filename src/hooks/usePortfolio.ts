import { CurrencyAmount, TokenAmount } from '@swapr/sdk'
import { useMemo } from 'react'
import { useActiveWeb3React } from '.'
import { useTotalSupplies } from '../data/TotalSupply'
import { useTokenBalances } from '../state/wallet/hooks'
import { useLPPairs } from './useLiquidityPositions'
import { useMultiplePairLiquidityUSD } from './usePairLiquidityUSD'

export interface Portfolio {
  [contractAddress: string]: {
    token: TokenAmount
    usdPrice: CurrencyAmount
  }
}

export const usePortfolio = () => {
  const { account } = useActiveWeb3React()
  const { data } = useLPPairs(account || undefined)

  const pairs = useMemo(() => {
    return (data && data.length && data.map(d => d.pair)) || undefined
  }, [data])

  const { loading, liquidityUSD } = useMultiplePairLiquidityUSD(pairs)

  const lpAddresses = useMemo(() => {
    return (data && data.length && data.map(d => d.pair.liquidityToken)) || undefined
  }, [data])

  const lpTokens = useMemo(() => {
    return (data && data.length && data.map(d => d.pair.liquidityToken)) || undefined
  }, [data])

  const totalSupplies = useTotalSupplies(lpAddresses)
  const balances = useTokenBalances(account || undefined, lpTokens)

  return useMemo(() => {
    if (!lpTokens || !pairs || !liquidityUSD || loading) return

    const portfolioBalances: Portfolio = {}

    totalSupplies.forEach((supply, i) => {
      const lpToken = lpTokens[i]
      const liquidity = liquidityUSD[i]
      const pair = pairs[i]
      const balance = balances[lpToken.address]
      if (!supply || !balance) return
      const t0 = pair.getLiquidityValue(pair.token0, supply, balance, false)
      const t1 = pair.getLiquidityValue(pair.token1, supply, balance, false)
      const share = balance.divide(supply)
      const shareValue = share.multiply(liquidity)
      const tokenValue = shareValue.divide(BigInt(2))

      if (portfolioBalances[pair.token0.address] && portfolioBalances[pair.token0.address].token) {
        portfolioBalances[pair.token0.address].token.add(t0)
        portfolioBalances[pair.token0.address].usdPrice.add(CurrencyAmount.usd(tokenValue.toFixed(6)))
      } else {
        portfolioBalances[pair.token0.address].token = t0
        portfolioBalances[pair.token0.address].usdPrice = CurrencyAmount.usd(tokenValue.toFixed(6))
      }

      if (portfolioBalances[pair.token1.address] && portfolioBalances[pair.token1.address].token) {
        portfolioBalances[pair.token1.address].token.add(t1)
        portfolioBalances[pair.token0.address].usdPrice.add(CurrencyAmount.usd(tokenValue.toFixed(6)))
      } else {
        portfolioBalances[pair.token1.address].token = t1
        portfolioBalances[pair.token0.address].usdPrice = CurrencyAmount.usd(tokenValue.toFixed(6))
      }
    })

    return portfolioBalances
  }, [totalSupplies, balances, lpTokens, pairs, liquidityUSD, loading])
}
