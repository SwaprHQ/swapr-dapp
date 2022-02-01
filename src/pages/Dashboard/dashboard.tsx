import React from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import Pair from '../../components/Pool/PairsList/Pair'
import PortfolioChart from './PortfolioChart'

export default function Dashboard() {
  const { portfolio, pairs } = usePortfolio()

  return (
    <div>
      <PortfolioChart portfolio={portfolio} />
      <div>
        {pairs
          ? pairs.map(pair => {
              if (!pair) return <></>
              return (
                <Pair
                  key={pair.position.pair.liquidityToken.address}
                  token0={pair.userToken0.token}
                  token1={pair.userToken1.token}
                  apy={pair.maximumApy}
                  usdLiquidity={pair.userLiquidityUSD}
                />
              )
            })
          : ''}
      </div>
    </div>
  )
}
