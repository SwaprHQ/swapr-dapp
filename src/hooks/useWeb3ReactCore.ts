import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getConnection } from '../connectors/utils'
import { NETWORK_DETAIL } from '../constants'
import { AppDispatch, AppState } from '../state'
import { ApplicationModal } from '../state/application/actions'
import { useOpenModal } from '../state/application/hooks'
import { setConnectorError, updatePendingConnector, updateSelectedConnector } from '../state/user/actions'
import { getErrorMessage } from '../utils/getErrorMessage'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  isActiveChainSupported: boolean
  connectorError: string | undefined
  tryActivation: (connector: Connector) => void
  tryDeactivation: (connector: Connector, account: string | undefined) => void
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const dispatch = useDispatch<AppDispatch>()
  const props = useWeb3React()
  const { chainId, isActive, connector } = props
  const [isActiveChainSupported, setIsActiveChainSupported] = useState(true)
  const openPendingWalletModal = useOpenModal(ApplicationModal.WALLET_PENDING)

  // needed to update if connected eagerly
  useEffect(() => {
    dispatch(updateSelectedConnector({ selectedConnector: getConnection(connector).type }))
  }, [connector, dispatch])

  useEffect(() => {
    const isDefinedAndSupported = isActive && chainId ? Object.keys(NETWORK_DETAIL).includes(chainId.toString()) : false
    setIsActiveChainSupported(isDefinedAndSupported)
  }, [chainId, isActive])

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connectorType = getConnection(connector).type

      dispatch(updatePendingConnector({ pendingConnector: connectorType }))
      dispatch(setConnectorError({ connector: connectorType, connectorError: undefined }))
      openPendingWalletModal()

      try {
        await connector.activate()
        dispatch(updateSelectedConnector({ selectedConnector: connectorType }))
      } catch (error) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(setConnectorError({ connector: connectorType, connectorError: getErrorMessage(error) }))
      }
    },
    [dispatch, openPendingWalletModal]
  )

  const tryDeactivation = useCallback(async (connector: Connector, account: string | undefined) => {
    if (!account) return
    if (connector.deactivate) {
      void connector.deactivate()
      return
    }
    void connector.resetState()
  }, [])

  const connectorError = useSelector((state: AppState) => {
    const { pending } = state.user.connector
    return pending ? state.user.connector.errorByType[pending] : undefined
  })

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    isActiveChainSupported,
    connectorError,
    tryActivation,
    tryDeactivation,
  }
}
