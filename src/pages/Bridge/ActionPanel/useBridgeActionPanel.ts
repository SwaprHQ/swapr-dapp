import { useCallback, useState, useEffect, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { Token } from '@swapr/sdk'
import { isToken } from '../../../hooks/Tokens'
import { useBridgeInfo } from '../../../state/bridge/hooks'
import { useHasPendingApproval } from '../../../state/transactions/hooks'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { useChains } from '../../../hooks/useChains'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { ArbitrumBridge } from '../../../services/Omnibridge/Arbitrum/ArbitrumBridge'

const defaultAddresses = {
  walletAddress: undefined,
  gatewayAddress: undefined
}

export const useBridgeActionPanel = () => {
  const { isArbitrum } = useChains()
  const omnibridge = useOmnibridge()
  const { currencyId, isBalanceSufficient, parsedAmount, bridgeCurrency, typedValue } = useBridgeInfo()
  const [{ walletAddress, gatewayAddress }, setAddresses] = useState<{
    walletAddress?: string
    gatewayAddress?: string
  }>(defaultAddresses)
  const pendingApproval = useHasPendingApproval((bridgeCurrency as Token)?.address, gatewayAddress)
  const [allowance, setAllowance] = useState<BigNumber | undefined>(undefined)
  const [checkingAllowance, setCheckingAllowance] = useState(false)
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const [showApprovalFlow, setShowApprovalFlow] = useState(false)
  const hasAmount = useMemo(() => !!Number(typedValue), [typedValue])

  const handleApprove = useCallback(async () => {
    if (!currencyId || !bridgeCurrency || !omnibridge.ready) return
    await omnibridge.approve(currencyId, gatewayAddress, bridgeCurrency.symbol)
  }, [currencyId, bridgeCurrency, omnibridge, gatewayAddress])

  useEffect(() => {
    if (!isArbitrum) {
      setShowApprovalFlow(false)
    }
  }, [currencyId, isArbitrum])

  useEffect(() => {
    if (!isArbitrum && approvalState === ApprovalState.NOT_APPROVED) {
      setShowApprovalFlow(true)
      return
    }
  }, [approvalState, isArbitrum])

  useEffect(() => {
    let active = true

    const checkAllowance = async () => {
      // TODO: Tmp solution, should be done by something like omnibridge.validate
      const activeBridge = omnibridge.activeBridge<ArbitrumBridge>()
      if (!currencyId || !activeBridge) return
      let tmpWalletAddress = walletAddress
      let tmpGatewayAddress = gatewayAddress

      setCheckingAllowance(true)

      if (!tmpWalletAddress && !tmpGatewayAddress) {
        ;[tmpWalletAddress, tmpGatewayAddress] = await Promise.all([
          activeBridge.bridge.l1Bridge.getWalletAddress(),
          activeBridge.bridge.l1Bridge.getGatewayAddress(currencyId)
        ])

        if (active) {
          setAddresses({ gatewayAddress: tmpGatewayAddress, walletAddress: tmpWalletAddress })
        }
      }

      if (tmpWalletAddress && tmpGatewayAddress) {
        // TODO: Find a better way to do it
        const { contract } = await activeBridge.bridge.l1Bridge.getL1TokenData(currencyId)
        const allowance = await contract.allowance(tmpWalletAddress, tmpGatewayAddress)

        if (active) {
          setAllowance(allowance)
        }
      }

      setCheckingAllowance(false)
    }

    if (!isArbitrum && isToken(bridgeCurrency) && !pendingApproval && parsedAmount) {
      checkAllowance()
    }

    return () => {
      active = false
    }
  }, [bridgeCurrency, currencyId, gatewayAddress, isArbitrum, omnibridge, parsedAmount, pendingApproval, walletAddress])

  useEffect(() => {
    if (isArbitrum || !isToken(bridgeCurrency) || !parsedAmount) return

    if (pendingApproval) {
      setApprovalState(ApprovalState.PENDING)
      return
    }

    if (checkingAllowance) {
      setApprovalState(ApprovalState.UNKNOWN)
      return
    }

    if (allowance) {
      if (parsedAmount.lessThan(allowance.toBigInt())) {
        setApprovalState(ApprovalState.APPROVED)
        return
      } else {
        setApprovalState(ApprovalState.NOT_APPROVED)
      }
    }
  }, [allowance, checkingAllowance, pendingApproval, bridgeCurrency, parsedAmount, isArbitrum])

  return {
    handleApprove,
    approvalState,
    isBalanceSufficient,
    showApprovalFlow,
    bridgeCurrency,
    isArbitrum,
    hasAmount
  }
}
