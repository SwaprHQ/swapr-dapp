import { Connector } from '@web3-react/types'
import CoinbaseWalletConnector from 'components/WalletSwitcher/Wallets/CoinbaseWalletConnector'
import MetaMaskConnector from 'components/WalletSwitcher/Wallets/MetaMaskConnector'
import WalletConnectConnector from 'components/WalletSwitcher/Wallets/WalletConnectConnector'
import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import React, { ReactNode, useRef } from 'react'
import styled from 'styled-components'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen } from '../../state/application/hooks'
import { StyledConnectedIcon } from '../../utils'
import Popover from '../Popover'

import { ModalView } from './'

const Wrapper = styled.div`
  width: 100%;
`

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  margin-top: 12px;
`

const ListItem = styled.li`
  & + & {
    margin-top: 20px;
    margin-bottom: 20px;
  }
`

export const DisconnectButton = styled.button`
  width: 100%;
  padding: 20px 18px;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.dark2};
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 0px 0px 8px 8px;
`

const ListButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0;
  font-weight: 700;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: ${({ theme }) => theme.text2};
  background: none;
  border: 0;
  outline: none;
  cursor: pointer;
  padding: 0 22px;

  &:disabled {
    cursor: not-allowed;
    filter: grayscale(90%);
    opacity: 0.6;
  }
`

const ListIconWrapper = styled.div<{ isActive?: boolean }>`
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-right: ${props => (props.isActive ? '34px' : '8px')};

  img {
    max-width: 100%;
  }
`

const StyledPopover = styled(Popover)<{ isActive?: boolean }>`
  max-width: 290px;
  background-color: ${({ theme }) => theme.bg1};
  border-color: ${({ theme }) => theme.dark2};
  border-style: solid;
  border-width: 1.2px;
  border-radius: 12px;
  border-image: none;
  padding: ${props => (props.isActive ? '8px 0 0 0' : '8px')};
`

interface ConnectWalletProps {
  setModal: (modal: ModalView | null) => void
  tryActivation: (connector: Connector) => void
  tryDeactivation: (connector: Connector, account: string | undefined) => void
  children: ReactNode
}

export const ConnectWalletPopover = ({ tryActivation, tryDeactivation, children }: ConnectWalletProps) => {
  const { connector, isActive, account } = useWeb3ReactCore()
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const walletSwitcherPopoverOpen = useModalOpen(ApplicationModal.WALLET_SWITCHER)
  const closeModals = useCloseModals()
  useOnClickOutside(popoverRef, () => {
    if (walletSwitcherPopoverOpen) closeModals()
  })

  return (
    <Wrapper>
      <StyledPopover
        innerRef={undefined}
        content={
          <List data-testid="wallet-connect-list">
            <MetaMaskConnector tryActivation={tryActivation} />
            <CoinbaseWalletConnector tryActivation={tryActivation} />
            <WalletConnectConnector tryActivation={tryActivation} />

            {isActive && (
              <DisconnectButton onClick={() => tryDeactivation(connector, account)}>Disconnect Wallet</DisconnectButton>
            )}
          </List>
        }
        show={walletSwitcherPopoverOpen}
        isActive={isActive}
        placement="bottom-end"
      >
        {children}
      </StyledPopover>
    </Wrapper>
  )
}

interface ItemProps {
  id: string
  icon: string
  name: string
  link?: string
  onClick?: () => void
  isActive?: boolean
}

export const Item = ({ id, onClick, name, icon, link, isActive }: ItemProps) => {
  const getContent = () => (
    <>
      <ListIconWrapper isActive={isActive}>
        {isActive && <StyledConnectedIcon width="50px" padding="0 0 0 12px" />}
        <img src={icon} alt={name + ' logo'} />
      </ListIconWrapper>
      {name}
    </>
  )

  return (
    <ListItem id={id}>
      {link ? (
        <ListButton as="a" href={link} target="_blank" rel="noopener noreferrer">
          {getContent()}
        </ListButton>
      ) : (
        <ListButton onClick={onClick}>{getContent()}</ListButton>
      )}
    </ListItem>
  )
}
