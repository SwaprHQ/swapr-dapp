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
  SWAP_INPUT_ERRORS,
} from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
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

const StyledLoadingSwapButtonText = styled(StyledSwapButtonText)`
  justify-content: end;
  flex: 1.1;
`

const StyledPlataformText = styled(Text)`
  text-transform: none;
  font-size: 15px;
`

interface SwapButtonProps {
  platformName?: string
  swapInputError?: number
  priceImpactSeverity: number
  isExpertMode: boolean
  amountInCurrencySymbol?: string
}

export const SwapButton = ({
  platformName,
  swapInputError,
  priceImpactSeverity,
  isExpertMode,
  amountInCurrencySymbol,
  ...rest
}: SwapButtonProps & ButtonProps) => {
  const { t } = useTranslation()

  const SWAP_INPUT_ERRORS_MESSAGE = {
    [SWAP_INPUT_ERRORS.CONNECT_WALLET]: 'Connect wallet',
    [SWAP_INPUT_ERRORS.ENTER_AMOUNT]: 'Enter amount',
    [SWAP_INPUT_ERRORS.SELECT_TOKEN]: 'Select token',
    [SWAP_INPUT_ERRORS.ENTER_RECIPIENT]: 'Enter recipient',
    [SWAP_INPUT_ERRORS.INVALID_RECIPIENT]: 'Invalid recipient',
    [SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE]: `Insufficient ${amountInCurrencySymbol} balance`,
  }

  return (
    <StyledSwapButton gradientColor={platformName && ROUTABLE_PLATFORM_STYLE[platformName].gradientColor} {...rest}>
      <StyledSwapButtonText>
        {swapInputError ? (
          SWAP_INPUT_ERRORS_MESSAGE[swapInputError]
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
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const routablePlatforms = chainId ? RoutablePlatformKeysByNetwork[chainId] : RoutablePlatformKeysByNetwork[1]
  return (
    <StyledSwapLoadingButton>
      <StyledLoadingSwapButtonText>{t('findingBestPrice')}</StyledLoadingSwapButtonText>
      <div className={`loading-button loading-rotation-${routablePlatforms.length}`}>
        {routablePlatforms.map((key: string) => (
          <div key={ROUTABLE_PLATFORM_STYLE[key].name}>
            <StyledPlataformImage
              width={21}
              height={21}
              src={ROUTABLE_PLATFORM_STYLE[key].logo}
              alt={ROUTABLE_PLATFORM_STYLE[key].alt}
            />
            <StyledSwapButtonText width={'120'}>{ROUTABLE_PLATFORM_STYLE[key].name}</StyledSwapButtonText>
          </div>
        ))}
      </div>
    </StyledSwapLoadingButton>
  )
}
