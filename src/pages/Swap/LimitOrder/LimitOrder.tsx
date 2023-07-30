import { useEffect, useState } from 'react'

import { PageMetaData } from '../../../components/PageMetaData'
import { useActiveWeb3React } from '../../../hooks'
import LimitOrder, { WalletData } from '../../../services/LimitOrders'
import { LimitOrderProvider } from '../../../services/LimitOrders/LimitOrder.provider'
import AppBody from '../../AppBody'

import LimitOrderFallback from './Components/LimitFallback'
import LimitOrderForm from './LimitOrderForm'

let limitSdk: LimitOrder = new LimitOrder()

export default function LimitOrderUI() {
  const { chainId, account, library: provider } = useActiveWeb3React()

  const [protocol, setProtocol] = useState(limitSdk.getActiveProtocol())

  useEffect(() => {
    limitSdk = new LimitOrder()
  }, [])

  useEffect(() => {
    async function updateSigner(signerData: WalletData) {
      await limitSdk.updateSigner(signerData)
      setProtocol(limitSdk.getActiveProtocol())
    }
    if (chainId && account && provider) {
      updateSigner({ activeChainId: chainId, account, provider })
    }
  }, [account, chainId, provider])

  return (
    <>
      <PageMetaData title="Limit Order | Swapr" />
      <AppBody>
        {protocol && (
          <LimitOrderProvider protocol={protocol}>
            <LimitOrderForm />
          </LimitOrderProvider>
        )}
        {!protocol && <LimitOrderFallback />}
      </AppBody>
    </>
  )
}
