import { Fetcher } from '@swapr/sdk'

import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { chainSupportsSWPR } from '../../utils/chainSupportsSWPR'
import { setProtocolFee, setSwapFees } from './actions'

export default function Updater() {
  const { provider, chainId } = useWeb3ReactCore()
  const dispatch = useDispatch()

  const isSWPRSupportedChain = chainSupportsSWPR(chainId)

  useEffect(() => {
    if (provider && chainId && isSWPRSupportedChain)
      Promise.all([
        Fetcher.fetchAllSwapFees(chainId, {}, provider as any),
        Fetcher.fetchProtocolFee(chainId, provider as any),
      ])
        .then(([swapFees, protocolFee]) => {
          if (swapFees) dispatch(setSwapFees({ swapFees }))
          if (protocolFee)
            dispatch(
              setProtocolFee({
                protocolFeeDenominator: Number(protocolFee.feeDenominator) + 1,
                protocolFeeTo: protocolFee.feeReceiver,
              })
            )
        })
        .catch(error => {
          console.error('Cancelled fetch for fees, error:', error)
          return
        })
  }, [provider, chainId, dispatch, isSWPRSupportedChain])

  return null
}
