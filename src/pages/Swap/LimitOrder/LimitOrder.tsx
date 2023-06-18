import { useEffect, useState } from 'react'

import { PageMetaData } from '../../../components/PageMetaData'
import { useActiveWeb3React } from '../../../hooks'
import LimitOrder, { LimitOrderChangeHandler } from '../../../services/LimitOrders'
import { LimitOrderProvider } from '../../../services/LimitOrders/LimitOrder.provider'
import AppBody from '../../AppBody'

import LimitOrderForm from './LimitOrderForm'

const limitSdk = new LimitOrder()

export default function LimitOrderUI() {
  const { chainId, account, library } = useActiveWeb3React()

  const [protocol, setProtocol] = useState(limitSdk.getActiveProtocol())

  useEffect(() => {
    // console.log('chainId change', chainId)
    async function updateSigner(signerData: LimitOrderChangeHandler) {
      await limitSdk.updateSigner(signerData)
      setProtocol(limitSdk.getActiveProtocol())
    }
    if (chainId && account && library) {
      updateSigner({ activeChainId: chainId, account, activeProvider: library })
    }
  }, [account, chainId, library])

  return (
    <>
      <PageMetaData title="Limit Order | Swapr" />
      <AppBody>
        {protocol && (
          <LimitOrderProvider protocol={protocol}>
            <LimitOrderForm />
          </LimitOrderProvider>
        )}
        {!protocol && <>Loading....</>}
      </AppBody>
    </>
  )
}
