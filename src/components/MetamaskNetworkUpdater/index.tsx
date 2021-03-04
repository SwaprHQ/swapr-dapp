import React, { useMemo } from 'react'
import { ChainId, Currency } from 'dxswap-sdk'
import { useCallback } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { getExplorerPrefix } from '../../utils'
import { NetworkConnector } from '@web3-react/network-connector'
import { AddButton, Root } from './styleds'
import { Box, Flex } from 'rebass'
import { NETWORK_LABELS } from '../Header'

interface AddEthereumChainParameter {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

const NETWORK_DETAILS: { [chainId: number]: AddEthereumChainParameter } = {
  [ChainId.XDAI]: {
    chainId: `0x${ChainId.XDAI.toString(16)}`,
    chainName: 'xDAI',
    nativeCurrency: {
      name: Currency.XDAI.name || 'xDAI',
      symbol: Currency.XDAI.symbol || 'xDAI',
      decimals: Currency.XDAI.decimals || 18
    },
    rpcUrls: ['https://rpc.xdaichain.com/'],
    blockExplorerUrls: [getExplorerPrefix(ChainId.XDAI)]
  }
}

export default function MetamaskNetworkAdder() {
  const { chainId, connector } = useActiveWeb3React()
  const open = useMemo(() => !!(chainId && connector instanceof NetworkConnector && NETWORK_DETAILS[chainId]), [
    chainId,
    connector
  ])

  const handleAddNetwork = useCallback(() => {
    if (!window.ethereum?.isMetaMask || !window.ethereum?.request || !chainId) return
    window.ethereum.request({ method: 'wallet_addEthereumChain', params: [NETWORK_DETAILS[chainId]] }).catch(error => {
      console.error(`error adding network ${NETWORK_LABELS[chainId]} to metamask`, error)
    })
  }, [chainId])

  if (!open || !chainId) return null
  return (
    <Root>
      <Flex flexDirection="column">
        <Box mb="12px">New to {NETWORK_LABELS[chainId]}?</Box>
        <Box>
          <AddButton onClick={handleAddNetwork}>Add</AddButton>
        </Box>
      </Flex>
    </Root>
  )
}
