import React from 'react'
import { usePortfolio } from '../../hooks/usePortfolio'

export default function Dashboard() {
  const portfolio = usePortfolio()

  return <div>{JSON.stringify(portfolio, undefined, 2)}</div>
}
