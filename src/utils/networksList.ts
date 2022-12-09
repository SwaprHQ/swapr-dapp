import { ChainId } from '@swapr/sdk'

import { NetworkOptions, networkOptionsPreset, NetworkOptionsPreset, NetworksList } from '../components/NetworkSwitcher'
import { NETWORK_DETAIL, NETWORK_OPTIONAL_DETAIL, TESTNETS } from '../constants'

export const getNetworkInfo = (chainId: ChainId, customPreset: NetworkOptionsPreset[] = networkOptionsPreset) => {
  const network = customPreset.find(net => {
    return net.chainId === chainId
  })

  const networkDetails = NETWORK_DETAIL[chainId] ?? NETWORK_DETAIL[ChainId.MAINNET]

  return {
    name: network ? network.name : '', //name displayed in swapr
    logoSrc: network ? network.logoSrc : '',
    color: network ? network.color : '',
    tag: network ? network.tag : undefined,
    chainName: networkDetails.chainName, //name used by connectors
    chainId: networkDetails.chainId,
    nativeCurrency: {
      name: networkDetails.nativeCurrency.name,
      symbol: networkDetails.nativeCurrency.symbol,
      decimals: networkDetails.nativeCurrency.decimals,
    },
    rpcUrls: networkDetails.rpcUrls,
    blockExplorerUrls: networkDetails.blockExplorerUrls,
    isArbitrum: NETWORK_OPTIONAL_DETAIL[chainId]?.isArbitrum ?? false,
    partnerChainId: NETWORK_OPTIONAL_DETAIL[chainId]?.partnerChainId,
  }
}

export const getNetworkById = (chainId: ChainId, networkList: NetworksList[]) => {
  for (const { networks } of networkList) {
    for (const config of networks) {
      if (config.preset.chainId === chainId) return config
    }
  }
  return undefined
}

export const getNetworkOptions = ({
  chainId,
  networkList,
}: {
  chainId: ChainId
  networkList: NetworksList[]
}): Partial<NetworkOptions> => {
  const { name, logoSrc, color, tag } = getNetworkInfo(chainId)
  const selectedNetwork = getNetworkById(chainId, networkList)

  return {
    preset: { chainId, name, logoSrc, color, tag },
    active: selectedNetwork?.active,
    disabled: selectedNetwork?.disabled,
  }
}

const createNetworkOptions = ({
  networkPreset,
  onNetworkChange,
  isNetworkDisabled,
  selectedNetworkChainId,
  activeChainId,
}: {
  networkPreset: NetworkOptionsPreset
  selectedNetworkChainId: ChainId
  activeChainId: ChainId | undefined
  onNetworkChange: (chainId: ChainId) => void
  isNetworkDisabled: (optionChainId: ChainId, selectedNetworkChainId: ChainId) => boolean
}): NetworkOptions => {
  const { chainId } = networkPreset
  return {
    preset: networkPreset,
    active: selectedNetworkChainId === activeChainId,
    disabled: isNetworkDisabled(networkPreset.chainId, selectedNetworkChainId),
    onClick: () => onNetworkChange(chainId),
  }
}

export const createNetworksList = ({
  networkOptionsPreset,
  onNetworkChange,
  isNetworkDisabled,
  selectedNetworkChainId,
  activeChainId,
  ignoreTags,
  showTestnets,
}: {
  networkOptionsPreset: NetworkOptionsPreset[]
  onNetworkChange: (chainId: ChainId) => void
  isNetworkDisabled: (optionChainId: ChainId, selectedNetworkChainId: ChainId) => boolean
  selectedNetworkChainId: ChainId
  activeChainId: ChainId | undefined
  ignoreTags?: string[]
  showTestnets?: boolean
}): NetworksList[] => {
  let networks = networkOptionsPreset

  if (ignoreTags?.length) {
    networks = networkOptionsPreset.map(item => {
      if (item.tag && ignoreTags?.includes(item.tag)) {
        return { ...item, tag: undefined }
      }
      return item
    })
  }

  return networks
    .filter(network => showTestnets || !TESTNETS.includes(network.chainId) || network.chainId === activeChainId)
    .reduce<NetworksList[]>((taggedList, currentNet) => {
      const tag = currentNet.tag
      const networkPreset = currentNet
      const enhancedNetworkOptions = createNetworkOptions({
        networkPreset,
        selectedNetworkChainId,
        activeChainId,
        onNetworkChange,
        isNetworkDisabled,
      })

      // check if tag exist and if not create array
      const tagArrIndex = taggedList.findIndex(existingTagArr => existingTagArr.tag === tag)
      if (tagArrIndex > -1) {
        taggedList[tagArrIndex].networks.push(enhancedNetworkOptions)
      } else {
        taggedList.push({ tag, networks: [enhancedNetworkOptions] })
      }
      return taggedList
    }, [])
}
