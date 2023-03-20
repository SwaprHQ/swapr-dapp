import styled from 'styled-components'

import Hero from '../../components/LandingPageComponents/layout/Hero'
import { LandingSections } from '../Swap/LandingSections'
import { Swapbox } from './Swapbox'

export default function Swap() {
  return (
    <Container>
      <Hero showMarquee={true}>
        <Swapbox />
      </Hero>
      <LandingSections />
    </Container>
  )
}

const Container = styled.div``
