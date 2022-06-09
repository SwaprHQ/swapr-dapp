import { ChainId } from '@swapr/sdk'

import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { ButtonConfirmed, ButtonPrimary } from '../../../components/Button'
import { ButtonConnect } from '../../../components/ButtonConnect'
import Loader from '../../../components/Loader'
import { networkOptionsPreset } from '../../../components/NetworkSwitcher'
import { RowBetween } from '../../../components/Row'
import { isToken } from '../../../hooks/Tokens'
import { useNetworkSwitch } from '../../../hooks/useNetworkSwitch'
import { AppState } from '../../../state'
import { BridgeButton } from './BridgeButton'
import { NetworkSwitcher } from './NetworkSwitcher'
import { useBridgeActionPanel } from './useBridgeActionPanel'

export type BridgeActionPanelProps = {
  account: string | null | undefined
  fromNetworkChainId: ChainId
  toNetworkChainId: ChainId
  isNetworkConnected: boolean
  isCollecting: boolean
  setIsCollecting: (collecting: boolean) => void
  handleModal: () => void
  handleCollect: () => void
}

export const BridgeActionPanel = ({
  isCollecting,
  account,
  handleModal,
  handleCollect,
  toNetworkChainId,
  fromNetworkChainId,
  isNetworkConnected,
}: BridgeActionPanelProps) => {
  const { selectNetwork } = useNetworkSwitch()
  const { bridgeCurrency, handleApprove } = useBridgeActionPanel()

  const { isLoading, isApproved, isBalanceSufficient, label } = useSelector(
    (state: AppState) => state.ecoBridge.ui.statusButton
  )

  const handleSelectFromNetwork = useCallback(() => {
    selectNetwork(fromNetworkChainId)
  }, [fromNetworkChainId, selectNetwork])

  const handleSelectToNetwork = useCallback(() => {
    selectNetwork(toNetworkChainId)
  }, [selectNetwork, toNetworkChainId])

  const selectPanel = () => {
    // No wallet
    if (!account) {
      return <ButtonConnect />
    }

    // Change network
    if (!isNetworkConnected && !isCollecting) {
      return (
        <ButtonPrimary onClick={handleSelectFromNetwork} data-testid="bridge-button">
          Connect to {networkOptionsPreset.find(network => network.chainId === fromNetworkChainId)?.name}
        </ButtonPrimary>
      )
    }

    //Collect
    if (isCollecting) {
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

      if (isNativeCurrency || isApproved) {
        return (
          <BridgeButton to={toNetworkChainId} from={fromNetworkChainId} onClick={handleModal}>
            {`Bridge to ${networkOptionsPreset.find(network => network.chainId === toNetworkChainId)?.name}`}
          </BridgeButton>
        )
      }

      if (!isNativeCurrency && !isApproved) {
        return (
          <RowBetween style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ButtonConfirmed
              onClick={handleApprove}
              disabled={isApproved}
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
          <div style={{ marginLeft: '5px', color: 'red' }}>
            <Loader stroke="#C0BAF6" />
          </div>
        )}
      </BridgeButton>
    )
  }

  return <div style={{ marginTop: '12px' }}>{selectPanel()}</div>
}
