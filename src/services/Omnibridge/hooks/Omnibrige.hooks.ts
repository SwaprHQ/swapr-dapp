import { useSelector } from 'react-redux'
import { AppState } from '../../../state'
import { useActiveWeb3React } from '../../../hooks'
import { selectAllTokensPerChain, selectAllActiveTokens, selectAllLists } from '../store/Omnibridge.selectors'

export const useAllBridgeTokens = () => {
  const { chainId } = useActiveWeb3React()
  const tokens = useSelector((state: AppState) => selectAllTokensPerChain(state, chainId ?? 0))

  return tokens
}

export const useBridgeActiveTokenMap = () => {
  const tokenMap = useSelector(selectAllActiveTokens)

  return tokenMap
}

export const useAllBridgeLists = () => {
  const allLists = useSelector(selectAllLists)

  return allLists
}
