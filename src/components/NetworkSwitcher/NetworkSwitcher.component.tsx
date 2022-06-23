import React, { useRef } from 'react'

import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletSwitcherPopoverToggle } from '../../state/application/hooks'
import { ChangeWalletButton, NetworkTagRow, OptionGrid, StyledPopover } from './NetworkSwitcher.styles'
import { NetworkSwitcherProps } from './NetworkSwitcher.types'
import Option from './Option'

export const NetworkSwitcher = ({
  show,
  networksList,
  children,
  placement,
  onOuterClick,
  parentRef,
  showWalletConnector = true,
}: NetworkSwitcherProps) => {
  const popoverRef = useRef(null)
  const { account, chainId } = useActiveWeb3React()
  const ethereumOptionPopoverOpen = useModalOpen(ApplicationModal.ETHEREUM_OPTION)

  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()

  useOnClickOutside(parentRef || popoverRef, () => {
    if (show || ethereumOptionPopoverOpen) onOuterClick()
  })

  return (
    <div ref={popoverRef} data-testid="network-switcher">
      <StyledPopover
        placement={placement}
        content={
          <>
            {networksList.map((network, index) => (
              <OptionGrid key={index}>
                <NetworkTagRow>{network.tag}</NetworkTagRow>
                {network.networks.map((props, index) => (
                  <Option key={index} {...props} connected={!!account && chainId === props.preset.chainId} />
                ))}
              </OptionGrid>
            ))}
            {showWalletConnector && !!account && (
              <ChangeWalletButton onClick={toggleWalletSwitcherPopover}>Change wallet</ChangeWalletButton>
            )}
          </>
        }
        show={show}
      >
        {children}
      </StyledPopover>
    </div>
  )
}
