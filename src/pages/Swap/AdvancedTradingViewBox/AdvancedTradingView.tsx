import { useEffect } from 'react'

import { TESTNETS } from '../../../constants'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../../hooks'
import { useIsDesktop } from '../../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../../hooks/useRouter'

import { AdvancedSwapMode } from './AdvancedSwapMode'

export function AdvancedTradingViewBox({ children }: { children: React.ReactNode }) {
  const { chainId } = useActiveWeb3React()

  const isUnsupportedChainIdError = useUnsupportedChainIdError()
  const isDesktop = useIsDesktop()

  const { navigate, pathname } = useRouter()
  const isInProMode = pathname.includes('/pro')

  useEffect(() => {
    if (isInProMode && !isDesktop) {
      navigate('/swap')
    }
  }, [isDesktop, navigate, isInProMode])

  return (
    <>
      {isInProMode && chainId && !isUnsupportedChainIdError && !TESTNETS.includes(chainId) && isDesktop && (
        <AdvancedSwapMode>{children}</AdvancedSwapMode>
      )}
    </>
  )
}
