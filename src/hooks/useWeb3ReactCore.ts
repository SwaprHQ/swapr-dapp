import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { web3Network } from 'connectors'
import { providers } from 'ethers'
import { useEffect, useState } from 'react'
import getLibrary from 'utils/getLibrary'

import { NETWORK_DETAIL } from '../constants'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  isCurrentChainUnsupported: boolean
}

let networkLibrary: providers.Web3Provider | undefined
export function getNetworkLibrary(): providers.Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(web3Network.provider))
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const props = useWeb3React()
  const [isCurrentChainUnsupported, setIsCurrentChainUnsupported] = useState(false)

  useEffect(() => {
    const isUnsupportedOrNotDefined = !props.chainId
      ? undefined
      : Object.keys(NETWORK_DETAIL).includes(props.chainId.toString())
    setIsCurrentChainUnsupported(isUnsupportedOrNotDefined === false)
  }, [props.chainId])

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    isCurrentChainUnsupported,
  }
}
