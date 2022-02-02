import React from 'react'
import styled from 'styled-components'
import { Portfolio } from '../../hooks/usePortfolio'
import { Doughnut, ChartProps } from 'react-chartjs-2'
import { Chart, ArcElement, Legend } from 'chart.js'

Chart.register(ArcElement)
Chart.register(Legend)

const ChartContainer = styled.div`
  outline: 1px solid red;
`
const getChartData = (portfolio: Portfolio): ChartProps<'doughnut'>['data'] => {
  const assets = Object.values(portfolio).sort((assetA, assetB) => {
    if (!assetA || !assetB) return 0
    return assetA.usd.greaterThan(assetB.usd) ? 1 : -1
  })

  return {
    labels: assets.filter(a => !!a).map(a => a?.token.token.symbol),
    datasets: [
      {
        label: 'Portfolio',
        data: assets.map(a => (a ? Number.parseFloat(a.usd.toSignificant(5)) : 0)),
        backgroundColor: ['green', 'blue', 'red']
      }
    ]
  }
}

interface PortfolioChartProps {
  portfolio?: Portfolio
}
// TODO: Handle this correctly with PropTypes?
// eslint-disable-next-line react/prop-types
const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolio }) => {
  return (
    <ChartContainer>
      {!portfolio ? (
        <div>Loading...</div>
      ) : (
        <Doughnut data={getChartData(portfolio)} options={{ plugins: { legend: { display: true } } }}></Doughnut>
      )}
    </ChartContainer>
  )
}

export default PortfolioChart
