import { Fetcher } from '@swapr/sdk'

import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { chainSupportsSWPR } from '../../utils/chainSupportsSWPR'
import { setProtocolFee, setSwapFees } from './actions'

export default function Updater() {
  const { library, chainId } = useWeb3React()
  const dispatch = useDispatch()

  const isSWPRSupportedChain = chainSupportsSWPR(chainId)

  useEffect(() => {
    if (library && chainId && isSWPRSupportedChain)
      Promise.all([
        Fetcher.fetchAllSwapFees(chainId, {}, library as any),
        Fetcher.fetchProtocolFee(chainId, library as any),
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
  }, [library, chainId, dispatch, isSWPRSupportedChain])

  return null
}
