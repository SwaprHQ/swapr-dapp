import { isChainSupportedByConnector } from 'connectors/utils'
import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import { shuffle } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'

import {
  PRICE_IMPACT_HIGH,
  PRICE_IMPACT_MEDIUM,
  ROUTABLE_PLATFORM_STYLE,
  RoutablePlatformKeysByNetwork,
} from '../../../constants'
import { ButtonPrimary } from '../../Button/index'

const StyledSwapButton = styled(ButtonPrimary)<{ gradientColor: string }>`
  background-image: ${({ gradientColor, disabled }) =>
    !disabled && gradientColor && `linear-gradient(90deg, #2E17F2 19.74%, ${gradientColor} 120.26%)`};
`

const StyledSwapLoadingButton = styled(ButtonPrimary)`
  background-image: linear-gradient(90deg, #4c4c76 19.74%, #292942 120.26%);
  cursor: 'wait';
  padding: 16px;
`

const StyledPlataformImage = styled.img`
  margin-top: -3px;
  margin-right: 6px;
`

const StyledSwapButtonText = styled(Text)<{ width?: string }>`
  display: flex;
  height: 16px;
  white-space: pre-wrap;
  width: ${({ width }) => (width ? `${width}px` : 'auto')};
`

const RotatingLogo = styled.div`
  position: relative;
  display: flex;
  justify-content: start;
  align-items: center;
  min-width: 112px;
  min-height: 22px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: center;
  `};
`

const LogoWithText = styled.div`
  opacity: 0;
  margin: auto;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledPlataformText = styled(Text)`
  text-transform: none;
  font-size: 15px;
`

interface SwapButtonProps {
  platformName?: string
  swapInputError?: string
  priceImpactSeverity: number
  isExpertMode: boolean
}

export const SwapButton = ({
  platformName,
  swapInputError,
  priceImpactSeverity,
  isExpertMode,
  ...rest
}: SwapButtonProps & ButtonProps) => {
  const { t } = useTranslation()

  return (
    <StyledSwapButton gradientColor={platformName && ROUTABLE_PLATFORM_STYLE[platformName].gradientColor} {...rest}>
      <StyledSwapButtonText>
        {swapInputError ? (
          swapInputError
        ) : priceImpactSeverity > PRICE_IMPACT_HIGH && !isExpertMode ? (
          t('priceImpactTooHigh')
        ) : (
          <>
            {t('swapWith')}
            {platformName && (
              <>
                {' '}
                <StyledPlataformImage
                  width={21}
                  height={21}
                  src={ROUTABLE_PLATFORM_STYLE[platformName].logo}
                  alt={ROUTABLE_PLATFORM_STYLE[platformName].alt}
                />
                <StyledPlataformText>{ROUTABLE_PLATFORM_STYLE[platformName].name}</StyledPlataformText>
              </>
            )}
            {priceImpactSeverity > PRICE_IMPACT_MEDIUM ? ` ${t('anyway')}` : ''}
          </>
        )}
      </StyledSwapButtonText>
    </StyledSwapButton>
  )
}

export const SwapLoadingButton = () => {
  const { t } = useTranslation('swap')
  const { connector, chainId } = useWeb3ReactCore()
  const routablePlatforms =
    chainId && isChainSupportedByConnector(connector, chainId)
      ? RoutablePlatformKeysByNetwork[chainId]
      : RoutablePlatformKeysByNetwork[1]
  return (
    <StyledSwapLoadingButton>
      <Text marginRight={[0, 2]}>{t('button.findingBestPrice')}</Text>
      <RotatingLogo className={`loading-rotation-${routablePlatforms.length}`}>
        {shuffle(routablePlatforms).map((key: string) => (
          <LogoWithText key={ROUTABLE_PLATFORM_STYLE[key].name}>
            <img
              src={ROUTABLE_PLATFORM_STYLE[key].logo}
              alt={ROUTABLE_PLATFORM_STYLE[key].alt}
              width={21}
              height={21}
            />
            <Text marginLeft={2}>{ROUTABLE_PLATFORM_STYLE[key].name}</Text>
          </LogoWithText>
        ))}
      </RotatingLogo>
    </StyledSwapLoadingButton>
  )
}
