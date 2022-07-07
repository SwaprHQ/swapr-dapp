import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { NetworkContextName } from '../../constants'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import useENSName from '../../hooks/useENSName'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { ApplicationModal } from '../../state/application/actions'
import {
  useCloseModals,
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useOpenModal,
  useWalletSwitcherPopoverToggle,
} from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
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
  const { account, connector, chainId } = useWeb3React()
  const { ENSName } = useENSName(account ?? undefined)
  const { avatar: ensAvatar } = useENSAvatar(ENSName)
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  const [modal, setModal] = useState<ModalView | null>(null)

  const [pendingError, setPendingError] = useState<boolean>()
  const [pendingWallet, setPendingWallet] = useState<MetaMask | CoinbaseWallet | WalletConnect | undefined>()

  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const openUnsupportedNetworkModal = useOpenModal(ApplicationModal.UNSUPPORTED_NETWORK)
  const { isActivating } = useWeb3React()
  const isNetwork = connector instanceof Network
  const [desiredChainId, setDesiredChainId] = useState<number>(isNetwork ? 1 : -1)

  const tryActivation = async (connector: MetaMask | CoinbaseWallet | WalletConnect | undefined) => {
    // TODO ?
    setPendingWallet(connector)
    setModal(ModalView.Pending)

    isActivating
      ? undefined
      : () =>
          !connector
            ? undefined
            : connector instanceof WalletConnect
            ? connector
                .activate(desiredChainId === -1 ? undefined : desiredChainId)
                .then(() => setPendingError(undefined))
                .catch(setPendingError)
            : connector
                .activate(desiredChainId === -1 ? undefined : desiredChainId) // TODO getAddChainParams?
                .then(() => setPendingError(undefined))
                .catch(setPendingError)
  }

  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { t } = useTranslation()
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
    unsupportedChainIdError,
    closeModals,
  ])

  const clickHandler = useCallback(() => {
    toggleNetworkSwitcherPopover()
  }, [toggleNetworkSwitcherPopover])

  if (pendingError) {
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
      <ConnectWalletPopover setModal={setModal} tryActivation={tryActivation}>
        <Row alignItems="center" justifyContent="flex-end">
          {chainId && !account && (
            <Button id="connect-wallet" onClick={toggleWalletSwitcherPopover}>
              {mobileByMedia ? 'Connect' : t('Connect wallet')}
            </Button>
          )}
          <AccountStatus
            pendingTransactions={pending}
            ENSName={ENSName ?? undefined}
            account={account}
            connector={connector}
            networkConnectorChainId={chainId}
            onAddressClick={() => setModal(ModalView.Account)}
            avatar={ensAvatar ?? undefined}
          />
        </Row>
      </ConnectWalletPopover>
      <WalletModal
        modal={modal}
        setModal={setModal}
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
        setPendingError={setPendingError}
        pendingWallet={pendingWallet}
        pendingError={pendingError}
        tryActivation={tryActivation}
      />
    </>
  )
}
