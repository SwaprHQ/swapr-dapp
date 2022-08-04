import { ChainId } from '@swapr/sdk'

import { Placement } from '@popperjs/core'
import React, { ReactNode } from 'react'

import { isChainSupportedByConnector } from '../../connectors/utils'
import { useNetworkSwitch } from '../../hooks/useNetworkSwitch'
import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen } from '../../state/application/hooks'
import { createNetworksList } from '../../utils/networksList'
import { networkOptionsPreset, NetworkSwitcher, NetworkSwitcherTags } from '../NetworkSwitcher'

interface NetworkSwitcherPopoverProps {
  children: ReactNode
  modal: ApplicationModal
  placement?: Placement
}

export default function NetworkSwitcherPopover({ children, modal, placement }: NetworkSwitcherPopoverProps) {
  const closeModals = useCloseModals()
  const { connector, chainId: activeChainId, account } = useWeb3ReactCore()
  const networkSwitcherPopoverOpen = useModalOpen(modal)

  const isNetworkDisabled = (chainId: ChainId) => {
    return activeChainId === chainId || !isChainSupportedByConnector(connector, chainId)
  }

  const { selectNetwork } = useNetworkSwitch()

  const networkList = createNetworksList({
    networkOptionsPreset,
    onNetworkChange: selectNetwork,
    isNetworkDisabled,
    selectedNetworkChainId: activeChainId ? activeChainId : -1,
    activeChainId: account ? activeChainId : -1,
    ignoreTags: [NetworkSwitcherTags.COMING_SOON],
    showTestnets: false,
  })

  return (
    <NetworkSwitcher
      networksList={networkList}
      show={networkSwitcherPopoverOpen}
      onOuterClick={closeModals}
      placement={placement}
    >
      {children}
    </NetworkSwitcher>
  )
}
