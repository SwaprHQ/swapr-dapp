import { Connector } from '@web3-react/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { getConnection } from '../../connectors/utils'
import { useENSAvatar } from '../../hooks/useENSAvatar'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
import { AppDispatch, AppState } from '../../state'
import { ApplicationModal, setConnectorError } from '../../state/application/actions'
import {
  useCloseModals,
  useModalOpen,
  useNetworkSwitcherPopoverToggle,
  useOpenModal,
  useWalletSwitcherPopoverToggle,
} from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { updateSelectedWallet } from '../../state/user/actions'
import { getErrorMessage } from '../../utils/getErrorMessage'
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
  const dispatch = useDispatch<AppDispatch>()
  const { account, connector: activeConnector, chainId, ENSName, isActiveChainSupported } = useWeb3ReactCore()
  const { avatar: ensAvatar } = useENSAvatar(ENSName)
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  const [modal, setModal] = useState<ModalView | null>(null)

  const [pendingConnector, setPendingConnector] = useState(activeConnector)
  const connectorError = useSelector((state: AppState) =>
    pendingConnector ? state.application.errorByConnectorType[getConnection(pendingConnector).type] : undefined
  )

  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const openUnsupportedNetworkModal = useOpenModal(ApplicationModal.UNSUPPORTED_NETWORK)

  const tryActivation = useCallback(
    async (connector: Connector) => {
      if (!connector) return
      setPendingConnector(connector)

      // show account details if pending connector is already in use
      if (connector === activeConnector) {
        setModal(ModalView.Account)
        return
      }

      try {
        dispatch(setConnectorError({ connector: getConnection(connector).type, connectorError: undefined }))
        setModal(ModalView.Pending)
        await connector.activate()
        dispatch(updateSelectedWallet({ selectedWallet: getConnection(connector).type }))
      } catch (error) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(
          setConnectorError({ connector: getConnection(connector).type, connectorError: getErrorMessage(error) })
        )
      }
    },
    [activeConnector, dispatch]
  )

  const tryDeactivation = useCallback(async (connector: Connector, account: string | undefined) => {
    if (!account) return
    if (connector?.deactivate) {
      void connector.deactivate()
    } else {
      void connector.resetState()
    }
  }, [])
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { t } = useTranslation('common')
  const mobileByMedia = useIsMobileByMedia()
  const [isUnsupportedNetwork, setUnsupportedNetwork] = useState(false)
  const isUnsupportedNetworkModal = useModalOpen(ApplicationModal.UNSUPPORTED_NETWORK)
  const closeModals = useCloseModals()

  // TODO unsupported chain id
  useEffect(() => {
    if (!isUnsupportedNetworkModal && !isUnsupportedNetwork && !isActiveChainSupported) {
      setUnsupportedNetwork(true)
      openUnsupportedNetworkModal()
    } else if (!isUnsupportedNetworkModal && isUnsupportedNetwork && isActiveChainSupported) {
      setUnsupportedNetwork(false)
    } else if (isUnsupportedNetworkModal && isActiveChainSupported) {
      closeModals()
    }
  }, [
    isUnsupportedNetwork,
    openUnsupportedNetworkModal,
    isUnsupportedNetworkModal,
    closeModals,
    isActiveChainSupported,
    activeConnector,
    chainId,
  ])

  const clickHandler = useCallback(() => {
    toggleNetworkSwitcherPopover()
  }, [toggleNetworkSwitcherPopover])

  if (!isActiveChainSupported) {
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
      <ConnectWalletPopover setModal={setModal} tryActivation={tryActivation} tryDeactivation={tryDeactivation}>
        <Row alignItems="center" justifyContent="flex-end">
          {chainId && !account && (
            <Button id="connect-wallet" onClick={toggleWalletSwitcherPopover}>
              {mobileByMedia ? 'Connect' : t('connectWallet')}
            </Button>
          )}
          <AccountStatus
            pendingTransactions={pending}
            ENSName={ENSName ?? undefined}
            account={account}
            connector={activeConnector}
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
        pendingConnector={pendingConnector}
        connectorError={!!connectorError}
        tryActivation={tryActivation}
      />
    </>
  )
}
