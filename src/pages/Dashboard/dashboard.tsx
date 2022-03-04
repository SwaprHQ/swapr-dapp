import React from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'
import PortfolioChart from './PortfolioChart'
import styled from 'styled-components'

const Position = styled.div`
  height: 100px;
  width: 480px;
  outline: 1px solid blue;
`

export default function Dashboard() {
  const { portfolio, pairs } = usePortfolio()

  return (
    <div>
      <PortfolioChart portfolio={portfolio} />
      <div>
        {pairs && pairs.length
          ? pairs.map((pair, index) => {
              if (!pair) return <div key={index}></div>
              return (
                <Position key={index}>
                  {pair.userToken0.token.symbol} - {pair.userToken1.token.symbol} ${pair.userLiquidityUSD.toFixed(2)}
                </Position>
              )
            })
          : ''}
      </div>
    </div>
  )
}
