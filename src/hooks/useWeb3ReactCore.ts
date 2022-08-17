import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { NETWORK_DETAIL } from '../constants'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  isActiveChainSupported: boolean
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const props = useWeb3React()
  const [isActiveChainSupported, setIsActiveChainSupported] = useState(true)

  useEffect(() => {
    const isDefinedAndSupported = props.chainId ? Object.keys(NETWORK_DETAIL).includes(props.chainId.toString()) : false

    setIsActiveChainSupported(isDefinedAndSupported)
  }, [props.chainId])

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    isActiveChainSupported,
  }
}
