import { CoWTrade, RoutablePlatform, Token } from '@swapr/sdk'

import './../../theme/landingPageTheme/stylesheet.css'
import { useCallback, useMemo, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ButtonGroup, ButtonGroupOption } from '../../components/ButtonGroup/ButtonGroup'
import { SimpleChartContainer } from '../../components/SimpleChart/SimpleChartContainer'
import AdvancedSwapDetailsDropdown from '../../components/Swap/AdvancedSwapDetailsDropdown'
import { Tabs } from '../../components/Swap/Tabs'
import { Swapbox } from '../../components/Swapbox/Swapbox'
import TokenWarningModal from '../../components/TokenWarningModal'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useWrapCallback, WrapType } from '../../hooks/useWrapCallback'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapState } from '../../state/swap/hooks'
import { Field } from '../../state/swap/types'
import { useAdvancedSwapDetails, useUpdateSelectedChartOption } from '../../state/user/hooks'
import { ChartOptions } from '../../state/user/reducer'
import BlogNavigation from './../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from './../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from './../../components/LandingPageComponents/CommunityLinks'
import Features from './../../components/LandingPageComponents/Features'
import Footer from './../../components/LandingPageComponents/layout/Footer'
import Hero from './../../components/LandingPageComponents/layout/Hero'
import Stats from './../../components/LandingPageComponents/Stats'
import Timeline from './../../components/LandingPageComponents/Timeline'

const AppBodyContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-height: calc(100vh - 340px);
  width: 100%;
  max-width: 460px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    min-height: 0;
    max-width: 550px;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 0;
    min-width: 100%;
  `};
`

const LandingBodyContainer = styled.section`
  width: calc(100% + 32px) !important;
`

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [platformOverride, setPlatformOverride] = useState<RoutablePlatform | null>(null)
  const allTokens = useAllTokens()
  const [showAdvancedSwapDetails] = useAdvancedSwapDetails()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedScammyTokens: Token[] = useMemo(() => {
    const normalizedAllTokens = Object.values(allTokens)
    if (normalizedAllTokens.length === 0) return []
    return [loadedInputCurrency, loadedOutputCurrency].filter((urlLoadedToken): urlLoadedToken is Token => {
      return (
        urlLoadedToken instanceof Token && !normalizedAllTokens.some(legitToken => legitToken.equals(urlLoadedToken))
      )
    })
  }, [loadedInputCurrency, loadedOutputCurrency, allTokens])
  const urlLoadedChainId = useTargetedChainIdFromUrl()
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const { chainId } = useActiveWeb3React()
  const [selectedChartOption, setselectedChartOption] = useUpdateSelectedChartOption()

  // swap state
  const { typedValue } = useSwapState()

  const {
    trade: potentialTrade,
    allPlatformTrades,
    currencies,
    loading,
  } = useDerivedSwapInfo(platformOverride || undefined)

  const { wrapType } = useWrapCallback(
    currencies.INPUT,
    currencies.OUTPUT,
    potentialTrade instanceof CoWTrade,
    potentialTrade?.inputAmount?.toSignificant(6) ?? typedValue
  )

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE && !(potentialTrade instanceof CoWTrade)

  const trade = showWrap ? undefined : potentialTrade

  const hasBothCurrenciesInput = currencies[Field.INPUT] && currencies[Field.OUTPUT]

  return (
    <>
      <TokenWarningModal
        isOpen={
          (!urlLoadedChainId || chainId === urlLoadedChainId) &&
          urlLoadedScammyTokens.length > 0 &&
          !dismissTokenWarning
        }
        tokens={urlLoadedScammyTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <Hero>
        <Flex
          justifyContent="center"
          alignItems={['center', 'center', 'center', 'start', 'start', 'start']}
          flexDirection={['column', 'column', 'column', 'row']}
        >
          <AppBodyContainer>
            <Flex
              mb={3}
              alignItems="center"
              justifyContent="space-between"
              width="100%"
              flexDirection={['column-reverse', 'row']}
            >
              <Tabs />

              <ButtonGroup mb={[3, 0]}>
                <ButtonGroupOption
                  disabled={!hasBothCurrenciesInput}
                  active={selectedChartOption === ChartOptions.SIMPLE_CHART}
                  onClick={() => setselectedChartOption(ChartOptions.SIMPLE_CHART)}
                >
                  Chart
                </ButtonGroupOption>
                <ButtonGroupOption
                  disabled={!hasBothCurrenciesInput}
                  active={selectedChartOption === ChartOptions.OFF}
                  onClick={() => setselectedChartOption(ChartOptions.OFF)}
                >
                  Off
                </ButtonGroupOption>
              </ButtonGroup>
            </Flex>
            <Swapbox />
            {showAdvancedSwapDetails && (
              <AdvancedSwapDetailsDropdown
                isLoading={loading}
                trade={trade}
                allPlatformTrades={allPlatformTrades}
                onSelectedPlatformChange={setPlatformOverride}
              />
            )}
          </AppBodyContainer>
          {hasBothCurrenciesInput && selectedChartOption === ChartOptions.SIMPLE_CHART && (
            <Flex
              width={['100%', '550px', '550px', '600px', '650px']}
              justifyContent="center"
              mt={[4, 4, 4, 0]}
              ml={[0, 0, 0, 3]}
            >
              <SimpleChartContainer currency0={currencies[Field.INPUT]} currency1={currencies[Field.OUTPUT]} />
            </Flex>
          )}
        </Flex>
      </Hero>
      <LandingBodyContainer>
        <Features />
        <Stats />
        <CommunityBanner />
        <Timeline />
        <CommunityLinks />
        <BlogNavigation />
      </LandingBodyContainer>
      <Footer />
    </>
  )
}
