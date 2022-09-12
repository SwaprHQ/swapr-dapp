import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useENSAvatar } from '../../hooks/useENSAvatar'
import { useIsMobileByMedia } from '../../hooks/useIsMobileByMedia'
import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
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

export default function Web3Status() {
  const { account, connector, chainId, ENSName, isActiveChainSupported, tryActivation, tryDeactivation } =
    useWeb3ReactCore()
  const { avatar: ensAvatar } = useENSAvatar(ENSName)
  const allTransactions = useAllSwapTransactions()
  const navigate = useNavigate()

  const pending = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter(tx => isTransactionRecent(tx) && !tx.receipt)
      .sort(newTransactionsFirst)
      .map(tx => tx.hash)
  }, [allTransactions])

  const toggleNetworkSwitcherPopover = useNetworkSwitcherPopoverToggle()
  const openUnsupportedNetworkModal = useOpenModal(ApplicationModal.UNSUPPORTED_NETWORK)
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { t } = useTranslation('common')
  const mobileByMedia = useIsMobileByMedia()
  const [isUnsupportedNetwork, setUnsupportedNetwork] = useState(false)
  const isUnsupportedNetworkModal = useModalOpen(ApplicationModal.UNSUPPORTED_NETWORK)
  const closeModals = useCloseModals()

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
    connector,
    chainId,
  ])

  const clickHandler = useCallback(() => {
    toggleNetworkSwitcherPopover()
  }, [toggleNetworkSwitcherPopover])

  return (
    <>
      <ConnectWalletPopover tryActivation={tryActivation} tryDeactivation={tryDeactivation}>
        <Row alignItems="center" justifyContent="flex-end">
          {!account && (
            <Button id="connect-wallet" onClick={toggleWalletSwitcherPopover}>
              {mobileByMedia ? 'Connect' : t('connectWallet')}
            </Button>
          )}
          {isActiveChainSupported ? (
            <AccountStatus
              pendingTransactions={pending}
              ENSName={ENSName ?? undefined}
              account={account}
              connector={connector}
              networkConnectorChainId={chainId}
              onAddressClick={() => navigate('/account')}
              avatar={ensAvatar ?? undefined}
            />
          ) : (
            <NetworkSwitcherPopover modal={ApplicationModal.NETWORK_SWITCHER}>
              <SwitchNetworkButton onClick={clickHandler}>
                Switch network
                <TriangleIcon />
              </SwitchNetworkButton>
            </NetworkSwitcherPopover>
          )}
        </Row>
      </ConnectWalletPopover>
      <WalletModal />
    </>
  )
}
