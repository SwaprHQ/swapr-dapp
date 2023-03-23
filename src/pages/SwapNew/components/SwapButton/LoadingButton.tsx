import { ChainId } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { RoutablePlatformKeysByNetwork } from '../../../../constants'
import { ROUTABLE_PLATFORM_STYLE } from '../../../../constants'
import { useActiveWeb3React } from '../../../../hooks'
import { StyledButton, SwapButtonLabel, PlatformLogo } from './styles'

export function LoadingButton() {
  const { chainId } = useActiveWeb3React()
  const routablePlatforms = chainId
    ? RoutablePlatformKeysByNetwork[chainId]
    : RoutablePlatformKeysByNetwork[ChainId.MAINNET]

  const [platformIndex, setPlatformIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformIndex(prev => (prev === routablePlatforms.length - 1 ? 0 : prev + 1))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <StyledButton disabled={true}>
      <SwapButtonLabel light={true}>Finding Best Price</SwapButtonLabel>
      {routablePlatforms.length !== 0 && (
        <PlatformLogo
          src={ROUTABLE_PLATFORM_STYLE[routablePlatforms[platformIndex]].logo}
          alt={ROUTABLE_PLATFORM_STYLE[routablePlatforms[platformIndex]].alt}
        />
      )}
      <SwapButtonLabel light={true}>{ROUTABLE_PLATFORM_STYLE[routablePlatforms[platformIndex]].name}</SwapButtonLabel>
    </StyledButton>
  )
}
