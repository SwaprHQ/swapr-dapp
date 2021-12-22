import { useEffect } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { Omnibridge } from '../../services/Omnibridge/Omnibridge'
import store from '../../state'

export const OmnibridgeService = new Omnibridge({ store })

export default function Updater(): null {
  const { account, library } = useActiveWeb3React()

  useEffect(() => {
    const init = async () => {
      if (account && library) {
        await OmnibridgeService.init({ account, activeProvider: library })
      }
    }
    init()
  }, [account, library])

  return null
}
