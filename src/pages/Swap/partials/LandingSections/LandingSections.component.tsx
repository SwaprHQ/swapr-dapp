import styled from 'styled-components'

import BlogNavigation from '../../../../components/LandingPageComponents/BlogNavigation'
import CommunityBanner from '../../../../components/LandingPageComponents/CommunityBanner'
import CommunityLinks from '../../../../components/LandingPageComponents/CommunityLinks'
import Features from '../../../../components/LandingPageComponents/Features'
import Footer from '../../../../components/LandingPageComponents/layout/Footer'
import Stats from '../../../../components/LandingPageComponents/Stats'
import Timeline from '../../../../components/LandingPageComponents/Timeline'

const LandingBodyContainer = styled.section`
  width: calc(100% + 32px) !important;
`

export function LandingSections() {
  return (
    <>
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
