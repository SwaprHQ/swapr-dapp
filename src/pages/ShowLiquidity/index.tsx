import React from 'react'

import { PageWrapper } from '../Pool/styleds'
import { AutoColumn } from '../../components/Column'
import Title from './Title'
import Container from './Container'
import Information from './Information'

export default function ShowLiquidity() {
  return (
    <PageWrapper>
      <AutoColumn gap="26px">
        <Title />
        <Container />
        <Information />
      </AutoColumn>
    </PageWrapper>
  )
}
