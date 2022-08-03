import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { web3Network } from 'connectors'
import { providers } from 'ethers'
import { useEffect, useState } from 'react'
import getLibrary from 'utils/getLibrary'

import { NETWORK_DETAIL } from '../constants'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  hasCurrentChainDetails: boolean
}

let networkLibrary: providers.Web3Provider | undefined
export function getNetworkLibrary(): providers.Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(web3Network.provider))
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const props = useWeb3React()
  const [hasCurrentChainDetails, setHasCurrentChainDetails] = useState(false)

  useEffect(() => {
    setHasCurrentChainDetails(props.chainId ? Object.keys(NETWORK_DETAIL).includes(props.chainId.toString()) : false)
  }, [props.chainId])

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    hasCurrentChainDetails,
  }
}
