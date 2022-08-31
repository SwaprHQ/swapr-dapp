import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass'
import { ButtonProps } from 'rebass/styled-components'
import styled, { css } from 'styled-components'

import {
  PRICE_IMPACT_HIGH,
  PRICE_IMPACT_MEDIUM,
  ROUTABLE_PLATFORM_STYLE,
  RoutablePlatformKeysByNetwork,
  SWAP_INPUT_ERRORS,
} from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { ButtonPrimary } from '../../Button'

function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)) // random index from 0 to i
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const StyledSwapButton = styled(ButtonPrimary)<{ gradientColor: string }>`
  background-image: ${({ gradientColor, disabled }) =>
    !disabled && gradientColor && `linear-gradient(90deg, #2E17F2 19.74%, ${gradientColor} 120.26%)`};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem 0.5rem;
  `};
`

const StyledSwapLoadingButton = styled(ButtonPrimary)`
  background-image: linear-gradient(90deg, #4c4c76 19.74%, #292942 120.26%);
  cursor: 'wait';
  padding: 16px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
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

const UnifyFontSize = css`
  font-size: 15px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 13px;
  `};
`

const StyledPlatformText = styled.div`
  text-transform: uppercase;
  margin-left: 0.5rem;
  ${UnifyFontSize}
`

const UnifiedText = styled(Text)`
  ${UnifyFontSize}
`

const AnywayText = styled.span`
  margin-left: 0.5rem;
  ${UnifyFontSize}
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
  const { t } = useTranslation('swap')

  const SWAP_INPUT_ERRORS_MESSAGE = {
    [SWAP_INPUT_ERRORS.CONNECT_WALLET]: t('button.connectWallet'),
    [SWAP_INPUT_ERRORS.ENTER_AMOUNT]: t('button.enterAmount'),
    [SWAP_INPUT_ERRORS.SELECT_TOKEN]: t('button.selectToken'),
    [SWAP_INPUT_ERRORS.ENTER_RECIPIENT]: t('button.enterRecipient'),
    [SWAP_INPUT_ERRORS.INVALID_RECIPIENT]: t('button.invalidRecipient'),
    [SWAP_INPUT_ERRORS.INSUFFICIENT_BALANCE]: t('button.insufficientCurrencyBalance', {
      currency: amountInCurrencySymbol,
    }),
  }

  return (
    <StyledSwapButton gradientColor={platformName && ROUTABLE_PLATFORM_STYLE[platformName].gradientColor} {...rest}>
      <Text marginLeft={2}>
        {swapInputError ? (
          SWAP_INPUT_ERRORS_MESSAGE[swapInputError]
        ) : priceImpactSeverity > PRICE_IMPACT_HIGH && !isExpertMode ? (
          t('button.priceImpactTooHigh')
        ) : (
          <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
            <UnifiedText>{t('button.swapWith')}</UnifiedText>
            {platformName && (
              <Flex alignItems="center" marginLeft={2}>
                <img
                  src={ROUTABLE_PLATFORM_STYLE[platformName].logo}
                  alt={ROUTABLE_PLATFORM_STYLE[platformName].alt}
                  width={21}
                  height={21}
                />
                <StyledPlatformText>{ROUTABLE_PLATFORM_STYLE[platformName].name}</StyledPlatformText>
              </Flex>
            )}
            <AnywayText>{priceImpactSeverity > PRICE_IMPACT_MEDIUM && t('button.anyway')}</AnywayText>
          </Flex>
        )}
      </Text>
    </StyledSwapButton>
  )
}

export const SwapLoadingButton = () => {
  const { t } = useTranslation('swap')
  const { chainId } = useActiveWeb3React()
  const routablePlatforms = chainId ? RoutablePlatformKeysByNetwork[chainId] : RoutablePlatformKeysByNetwork[1]
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
