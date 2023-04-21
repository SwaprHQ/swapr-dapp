import styled from 'styled-components'

import BlogNavigation from '../../../components/LandingPageComponents/BlogNavigation'
import Features from '../../../components/LandingPageComponents/Features'
import Footer from '../../../components/LandingPageComponents/layout/Footer'
import Stats from '../../../components/LandingPageComponents/Stats'

const LandingBodyContainer = styled.section`
  width: calc(100% + 32px) !important;
`

export function LandingSections() {
  return (
    <>
      <LandingBodyContainer>
        <Features />
        <Stats />
        <BlogNavigation />
      </LandingBodyContainer>
      <Footer />
    </>
  )
}
