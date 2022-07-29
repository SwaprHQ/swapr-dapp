import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { web3Network } from 'connectors'
import { isChainAllowed } from 'connectors/utils'
import { providers } from 'ethers'
import { useEffect, useState } from 'react'
import getLibrary from 'utils/getLibrary'

import { NETWORK_DETAIL } from '../constants'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  isSupportedChainId: boolean
}

let networkLibrary: providers.Web3Provider | undefined
export function getNetworkLibrary(): providers.Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(web3Network.provider))
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const props = useWeb3React()
  const [isSupportedChainId, setIsSupportedChainId] = useState(true)

  useEffect(() => {
    if (props.chainId) {
      props.connector
        ? setIsSupportedChainId(isChainAllowed(props.connector, props.chainId))
        : setIsSupportedChainId(Object.keys(NETWORK_DETAIL).includes(props.chainId.toString()))
    }
  }, [props.chainId, props.connector])

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    isSupportedChainId,
  }
}
