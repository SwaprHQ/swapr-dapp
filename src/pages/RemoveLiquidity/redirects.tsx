import { Navigate, useParams } from 'react-router-dom'

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/

export function RedirectOldRemoveLiquidityPathStructure() {
  const { tokens } = useParams<{ tokens: string }>()

  if (tokens && !OLD_PATH_STRUCTURE.test(tokens)) {
    return <Navigate to="/pools" replace />
  }
  const [currency0, currency1] = tokens!.split('-')

  return <Navigate to={`/pools/remove/${currency0}/${currency1}`} replace />
}
