import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { network } from '../../connectors'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import { useENSName } from '../../hooks/useENSName'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { ApplicationModal } from '../../state/application/actions'
import {
  useCloseModals,
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useOpenModal,
  useWalletSwitcherPopoverToggle,
} from '../../state/application/hooks'
import { isTransactionRecent, useAllSwapTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { TriangleIcon } from '../Icons'
import NetworkSwitcherPopover from '../NetworkSwitcherPopover'
import Row from '../Row'
import WalletModal from '../WalletModal'

import { AccountStatus } from './AccountStatus'
import { ConnectWalletPopover } from './ConnectWalletPopover'

const SwitchNetworkButton = styled.button`
  display: flex;
  align-items: center;
  height: 29px;
  padding: 8px 14px;
  margin-left: 8px;
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.text1};
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 11px;
  line-height: 12px;
  letter-spacing: 0.08em;
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'text' : 'pointer')};
`

export const Button = styled.button`
  height: 29px;
  padding: 10.5px 14px;
  margin: 0 0 0 auto;
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.text1};
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 12px;
  line-height: 10px;
  letter-spacing: 0.08em;
  border: none;
  outline: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export enum ModalView {
  Pending,
  Account,
}

export default function Web3Status() {
  const { isActive, account, hooks } = useWeb3React()
  const { chainId: networkConnectorChainId, connector: activeConnector } = useActiveWeb3React()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { ENSName } = useENSName(account ?? undefined)
  const { avatar: ensAvatar } = useENSAvatar(ENSName)
  const allTransactions = useAllSwapTransactions()

  const pending = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter(tx => isTransactionRecent(tx) && !tx.receipt)
      .sort(newTransactionsFirst)
      .map(tx => tx.hash)
  }, [allTransactions])

  const [modal, setModal] = useState<ModalView | null>(null)

  const [pendingError, setPendingError] = useState<boolean>()
  const [pendingWallet, setPendingWallet] = useState<Connector | undefined>()

  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const openUnsupportedNetworkModal = useOpenModal(ApplicationModal.UNSUPPORTED_NETWORK)

  const tryActivation = async (connector: Connector | undefined) => {
    setPendingWallet(connector)
    setModal(ModalView.Pending)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    // eslint-disable-next-line
    // @ts-ignore
    if (connector instanceof WalletConnect && connector.walletConnectProvider?.wc?.uri) {
      connector.deactivate ? connector.deactivate() : connector.resetState()
    }

    if (connector) {
      connector.activate(networkConnectorChainId)?.catch(error => {
        console.error('Error while activating connector: ', error)
      })
    }
  }

  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { t } = useTranslation('common')
  const mobileByMedia = useIsMobileByMedia()
  const [isUnsupportedNetwork, setUnsupportedNetwork] = useState(false)
  const isUnsupportedNetworkModal = useModalOpen(ApplicationModal.UNSUPPORTED_NETWORK)
  const closeModals = useCloseModals()

  const unsupportedChainIdError = useUnsupportedChainIdError()

  useEffect(() => {
    if (!isUnsupportedNetworkModal && !isUnsupportedNetwork && unsupportedChainIdError) {
      setUnsupportedNetwork(true)
      openUnsupportedNetworkModal()
    } else if (!isUnsupportedNetworkModal && isUnsupportedNetwork && !unsupportedChainIdError) {
      setUnsupportedNetwork(false)
    } else if (isUnsupportedNetworkModal && !unsupportedChainIdError) {
      closeModals()
    }
  }, [
    isUnsupportedNetwork,
    openUnsupportedNetworkModal,
    isUnsupportedNetworkModal,
    closeModals,
    unsupportedChainIdError,
  ])

  const clickHandler = useCallback(() => {
    toggleNetworkSwitcherPopover()
  }, [toggleNetworkSwitcherPopover])

  const { useSelectedIsActive } = hooks
  const networkIsActive = useSelectedIsActive(network)

  if (!networkIsActive && !isActive) {
    return null
  }

  if (unsupportedChainIdError) {
    return (
      <NetworkSwitcherPopover modal={ApplicationModal.NETWORK_SWITCHER}>
        <SwitchNetworkButton onClick={clickHandler}>
          Switch network
          <TriangleIcon />
        </SwitchNetworkButton>
      </NetworkSwitcherPopover>
    )
  }

  return (
    <>
      <ConnectWalletPopover tryActivation={tryActivation}>
        <Row alignItems="center" justifyContent="flex-end">
          {!account && (
            <Button id="connect-wallet" onClick={toggleWalletSwitcherPopover}>
              {mobileByMedia ? 'Connect' : t('connectWallet')}
            </Button>
          )}
          <AccountStatus
            pendingTransactions={pending}
            ENSName={ENSName ?? undefined}
            account={account}
            connector={activeConnector}
            networkConnectorChainId={networkConnectorChainId}
            onAddressClick={() =>
              navigate({
                pathname: '/account',
                search: `?${createSearchParams(searchParams)}`,
              })
            }
            avatar={ensAvatar ?? undefined}
          />
        </Row>
      </ConnectWalletPopover>
      <WalletModal
        modal={modal}
        setModal={setModal}
        setPendingError={setPendingError}
        pendingWallet={pendingWallet}
        pendingError={pendingError}
        tryActivation={tryActivation}
      />
    </>
  )
}
