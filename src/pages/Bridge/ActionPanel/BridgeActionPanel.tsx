import React from 'react'
import { ChainId } from '@swapr/sdk'
import { ButtonPrimary } from '../../../components/Button'
import { useNetworkSwitch } from '../../../hooks/useNetworkSwitch'
import { useWalletSwitcherPopoverToggle } from '../../../state/application/hooks'
import { BridgeStep } from '../utils'
import { NetworkSwitcher } from './NetworkSwitcher'
import { BridgeButton } from './BridgeButton'
import { networkOptionsPreset } from '../../../components/NetworkSwitcher'
import { isToken } from '../../../hooks/Tokens'
import { ButtonConfirmed } from '../../../components/Button'
import { RowBetween } from '../../../components/Row'
import { useBridgeActionPanel } from './useBridgeActionPanel'
import { useSelector } from 'react-redux'
import { AppState } from '../../../state'
import Loader from '../../../components/Loader'

export type BridgeActionPanelProps = {
  account: string | null | undefined
  fromNetworkChainId: ChainId
  toNetworkChainId: ChainId
  isNetworkConnected: boolean
  step: BridgeStep
  setStep: (step: BridgeStep) => void
  handleModal: () => void
  handleCollect: () => void
}

export const BridgeActionPanel = ({
  step,
  account,
  handleModal,
  handleCollect,
  toNetworkChainId,
  fromNetworkChainId,
  isNetworkConnected
}: BridgeActionPanelProps) => {
  const { selectEthereum, selectNetwork } = useNetworkSwitch()
  const toggleWalletSwitcherPopover = useWalletSwitcherPopoverToggle()
  const { bridgeCurrency, handleApprove } = useBridgeActionPanel()

  const { isLoading, approved, isBalanceSufficient, label } = useSelector(
    (state: AppState) => state.omnibridge.UI.statusButton
  )

  const selectPanel = () => {
    // No wallet
    if (!account) {
      return <ButtonPrimary onClick={toggleWalletSwitcherPopover}>Connect wallet</ButtonPrimary>
    }

    // Change network
    if (!isNetworkConnected && step !== BridgeStep.Collect) {
      return (
        <ButtonPrimary
          onClick={() =>
            fromNetworkChainId === ChainId.MAINNET ? selectEthereum() : selectNetwork(fromNetworkChainId)
          }
        >
          Connect to {networkOptionsPreset.find(network => network.chainId === fromNetworkChainId)?.name}
        </ButtonPrimary>
      )
    }

    //Collect
    if (step === BridgeStep.Collect) {
      return (
        <NetworkSwitcher
          sendToId={toNetworkChainId}
          onSwitchClick={() =>
            toNetworkChainId === ChainId.MAINNET ? selectEthereum() : selectNetwork(toNetworkChainId)
          }
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
