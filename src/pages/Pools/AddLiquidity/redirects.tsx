import { Navigate, useParams } from 'react-router-dom'

import AddLiquidity from './index'

type CurrencySearchParams = {
  currencyIdA: string
  currencyIdB: string
}

export function RedirectToAddLiquidity() {
  return <Navigate to="/pools/add/" replace />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
export function RedirectOldAddLiquidityPathStructure() {
  const params = useParams<CurrencySearchParams['currencyIdA']>()
  const match = params?.currencyIdA?.match(OLD_PATH_STRUCTURE)
  if (match?.length) {
    return <Navigate to={`/pools/add/${match[1]}/${match[2]}`} replace />
  }

  return <AddLiquidity />
}

export function RedirectDuplicateTokenIds() {
  const { currencyIdA, currencyIdB } = useParams<CurrencySearchParams>()
  if (currencyIdA?.toLowerCase() === currencyIdB?.toLowerCase()) {
    return <Navigate to={`/pools/add/${currencyIdA}`} replace />
  }
  return <AddLiquidity />
}
