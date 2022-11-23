import { RoutablePlatform, Token } from '@swapr/sdk'

import './../../theme/landingPageTheme/stylesheet.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ChartToggle } from '../../components/ChartToggle'
import { PageMetaData } from '../../components/PageMetaData'
import { SimpleChartContainer } from '../../components/SimpleChart/SimpleChartContainer'
import { Tabs } from '../../components/Swap/Tabs'
import TokenWarningModal from '../../components/TokenWarningModal'
import { TESTNETS } from '../../constants'
import { REACT_APP_FEATURE_SIMPLE_CHART } from '../../constants/features'
import { useActiveWeb3React, useUnsupportedChainIdError } from '../../hooks'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { useIsDesktop } from '../../hooks/useIsDesktopByMedia'
import { useRouter } from '../../hooks/useRouter'
import { useTargetedChainIdFromUrl } from '../../hooks/useTargetedChainIdFromUrl'
import { useDefaultsFromURLSearch, useDerivedSwapInfo } from '../../state/swap/hooks'
import { Field } from '../../state/swap/types'
import { useUpdateSelectedChartOption, useUpdateSelectedSwapTab } from '../../state/user/hooks'
import { ChartOptions } from '../../state/user/reducer'
import BlogNavigation from './../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from './../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from './../../components/LandingPageComponents/CommunityLinks'
import Features from './../../components/LandingPageComponents/Features'
import Footer from './../../components/LandingPageComponents/layout/Footer'
import Hero from './../../components/LandingPageComponents/layout/Hero'
import Stats from './../../components/LandingPageComponents/Stats'
import Timeline from './../../components/LandingPageComponents/Timeline'
import { AdvancedSwapMode } from './AdvancedSwapMode'
import { Swapbox } from './Swapbox/Swapbox'

const AppBody = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  min-height: calc(100vh - 340px);
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
  const isDesktop = useIsDesktop()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [platformOverride] = useState<RoutablePlatform | null>(null)
  const allTokens = useAllTokens()
  const { navigate, pathname } = useRouter()
  const isInProMode = pathname.includes('/pro')
  const [activeTab, setActiveTab] = useUpdateSelectedSwapTab()
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

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

  // redirect to /swap if user is in pro mode on mobile
  useEffect(() => {
    if (isInProMode && !isDesktop) {
      navigate('/swap')
    }
  }, [isDesktop, navigate, isInProMode])

  const { chainId } = useActiveWeb3React()
  const [selectedChartOption, setselectedChartOption] = useUpdateSelectedChartOption()

  const { currencies } = useDerivedSwapInfo(platformOverride || undefined)
  const hasBothCurrenciesInput = !!(currencies[Field.INPUT] && currencies[Field.OUTPUT])

  const renderSwapBox = () => (
    <AppBody>
      <Flex mb={2} alignItems="center" justifyContent="space-between" width="100%">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {REACT_APP_FEATURE_SIMPLE_CHART && !isInProMode && (
          <ChartToggle
            hasBothCurrenciesInput={hasBothCurrenciesInput}
            selectedChartOption={selectedChartOption}
            setselectedChartOption={setselectedChartOption}
          />
        )}
      </Flex>
      <Swapbox />
    </AppBody>
  )

  return (
    <>
      <PageMetaData title="Swap | Swapr" />
      <TokenWarningModal
        isOpen={
          (!urlLoadedChainId || chainId === urlLoadedChainId) &&
          urlLoadedScammyTokens.length > 0 &&
          !dismissTokenWarning
        }
        tokens={urlLoadedScammyTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      {isInProMode && chainId && !isUnsupportedChainIdError && !TESTNETS.includes(chainId) && isDesktop && (
        <AdvancedSwapMode>{renderSwapBox()}</AdvancedSwapMode>
      )}
      {selectedChartOption !== ChartOptions.PRO && !isInProMode && (
        <>
          <Hero>
            <Flex
              justifyContent="center"
              alignItems={['center', 'center', 'center', 'start', 'start', 'start']}
              flexDirection={['column', 'column', 'column', 'row']}
            >
              {renderSwapBox()}
              {REACT_APP_FEATURE_SIMPLE_CHART &&
                !isInProMode &&
                hasBothCurrenciesInput &&
                selectedChartOption === ChartOptions.SIMPLE_CHART && (
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
      )}
    </>
  )
}
