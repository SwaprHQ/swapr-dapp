import { Connector } from '@web3-react/types'

export type ConnectorProps = {
  tryActivation: (connector: Connector) => void
}
