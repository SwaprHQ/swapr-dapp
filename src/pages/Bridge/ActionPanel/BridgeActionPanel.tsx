import React, { useCallback } from 'react'
import { ChainId } from '@swapr/sdk'
import { useSelector } from 'react-redux'
import { ButtonPrimary } from '../../../components/Button'
import { useNetworkSwitch } from '../../../hooks/useNetworkSwitch'
import { useModalOpen, useWalletSwitcherPopoverToggle } from '../../../state/application/hooks'
import { NetworkSwitcher } from './NetworkSwitcher'
import { BridgeButton } from './BridgeButton'
import { networkOptionsPreset } from '../../../components/NetworkSwitcher'
import { isToken } from '../../../hooks/Tokens'
import { ButtonConfirmed } from '../../../components/Button'
import { RowBetween } from '../../../components/Row'
import { useBridgeActionPanel } from './useBridgeActionPanel'
import { AppState } from '../../../state'
import Loader from '../../../components/Loader'
import { ApplicationModal } from '../../../state/application/actions'

export type BridgeActionPanelProps = {
  account: string | null | undefined
  fromNetworkChainId: ChainId
  toNetworkChainId: ChainId
  isNetworkConnected: boolean
  collecting: boolean
  setCollecting: (collecting: boolean) => void
  handleModal: () => void
  handleCollect: () => void
}

export const BridgeActionPanel = ({
  collecting,
  account,
  handleModal,
  handleCollect,
  toNetworkChainId,
  fromNetworkChainId,
  isNetworkConnected
}: BridgeActionPanelProps) => {
  const { selectNetwork } = useNetworkSwitch()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { bridgeCurrency, handleApprove } = useBridgeActionPanel()

  const { isLoading, approved, isBalanceSufficient, label } = useSelector(
    (state: AppState) => state.ecoBridge.UI.statusButton
  )

  const networkSwitcherPopoverOpen = useModalOpen(ApplicationModal.NETWORK_SWITCHER)

  const handleSelectFromNetwork = useCallback(() => {
    selectNetwork(fromNetworkChainId)
  }, [fromNetworkChainId, selectNetwork])

  const handleSelectToNetwork = useCallback(() => {
    selectNetwork(toNetworkChainId)
  }, [selectNetwork, toNetworkChainId])

  const selectPanel = () => {
    // No wallet
    if (!account) {
      return (
        <ButtonPrimary onClick={toggleWalletSwitcherPopover} disabled={networkSwitcherPopoverOpen}>
          {networkSwitcherPopoverOpen ? 'Switch network' : 'Connect wallet'}
        </ButtonPrimary>
      )
    }

    // Change network
    if (!isNetworkConnected && !collecting) {
      return (
        <ButtonPrimary onClick={handleSelectFromNetwork}>
          Connect to {networkOptionsPreset.find(network => network.chainId === fromNetworkChainId)?.name}
        </ButtonPrimary>
      )
    }

    //Collect
    if (collecting) {
      return (
        <NetworkSwitcher
          sendToId={toNetworkChainId}
          onSwitchClick={handleSelectToNetwork}
          onCollectClick={handleCollect}
        />
      )
    }

    if (!isLoading && isBalanceSufficient) {
      const isNativeCurrency = !isToken(bridgeCurrency)

      if (isNativeCurrency || approved) {
        return (
          <BridgeButton to={toNetworkChainId} from={fromNetworkChainId} onClick={handleModal}>
            {`Bridge to ${networkOptionsPreset.find(network => network.chainId === toNetworkChainId)?.name}`}
          </BridgeButton>
        )
      }

      if (!isNativeCurrency && !approved) {
        return (
          <RowBetween style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ButtonConfirmed
              onClick={handleApprove}
              disabled={approved}
              width="100%"
              altDisabledStyle={false}
              confirmed={false}
            >
              Approve {bridgeCurrency?.symbol}
            </ButtonConfirmed>
          </RowBetween>
        )
      }
    }
    // No Amount/Token/Balance/Loading
    return (
      <BridgeButton to={toNetworkChainId} from={fromNetworkChainId} disabled onClick={handleModal}>
        {label}
        {isLoading && (
          <div style={{ marginLeft: '5px' }}>
            <Loader />
          </div>
        )}
      </BridgeButton>
    )
  }

  return <div style={{ marginTop: '12px' }}>{selectPanel()}</div>
}
