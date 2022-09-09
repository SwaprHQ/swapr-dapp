import { ChainId } from '@swapr/sdk'

import { useWeb3React, Web3ContextType } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ModalView } from '../components/Web3Status'
import { getConnection } from '../connectors/utils'
import { NETWORK_DETAIL } from '../constants'
import { AppDispatch, AppState } from '../state'
import { setConnectorError } from '../state/application/actions'
import { updateSelectedWallet } from '../state/user/actions'
import { getErrorMessage } from '../utils/getErrorMessage'

type Web3ReactProps = Omit<Web3ContextType, 'chainId'> & {
  chainId?: ChainId
  isActiveChainSupported: boolean
  pendingConnector: Connector
  connectorError: string | undefined
  modal: ModalView | null
  setModal: (modal: ModalView | null) => void
  tryActivation: (connector: Connector) => void
  tryDeactivation: (connector: Connector, account: string | undefined) => void
}

export const useWeb3ReactCore = (): Web3ReactProps => {
  const dispatch = useDispatch<AppDispatch>()
  const props = useWeb3React()
  const { connector: activeConnector, chainId } = props
  const [isActiveChainSupported, setIsActiveChainSupported] = useState(true)
  const [pendingConnector, setPendingConnector] = useState(activeConnector)
  const [modal, setModal] = useState<ModalView | null>(null)

  useEffect(() => {
    const isDefinedAndSupported = chainId ? Object.keys(NETWORK_DETAIL).includes(chainId.toString()) : false
    setIsActiveChainSupported(isDefinedAndSupported)
  }, [chainId])

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connectorType = getConnection(connector).type
      setPendingConnector(connector)

      dispatch(setConnectorError({ connector: connectorType, connectorError: undefined }))

      try {
        await connector.activate()
        dispatch(updateSelectedWallet({ selectedWallet: connectorType }))
      } catch (error) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(setConnectorError({ connector: connectorType, connectorError: getErrorMessage(error) }))
      }
    },
    [dispatch]
  )

  const tryDeactivation = useCallback(async (connector: Connector, account: string | undefined) => {
    if (!account) return
    if (connector.deactivate) {
      void connector.deactivate()
      return
    }
    void connector.resetState()
  }, [])

  const connectorError = useSelector((state: AppState) =>
    pendingConnector ? state.application.errorByConnectorType[getConnection(pendingConnector).type] : undefined
  )

  return {
    ...props,
    chainId: (props.chainId as ChainId) ?? undefined,
    isActiveChainSupported,
    pendingConnector,
    connectorError,
    modal,
    setModal,
    tryActivation,
    tryDeactivation,
  }
}
