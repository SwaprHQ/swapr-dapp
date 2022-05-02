import React from 'react'
import styled from 'styled-components'
import Skeleton from 'react-loading-skeleton'
import { Flex } from 'rebass'
import DoubleCurrencyLogo from '../../../DoubleLogo'

const SizedCard = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  border-top: 1px solid ${props => props.theme.bg3};
  padding: 22px;
`

export default function LoadingCard() {
  return (
    <SizedCard>
      <Flex alignItems="center" flexDirection="row">
        <DoubleCurrencyLogo spaceBetween={0} marginLeft={0} marginRight={14} top={0} loading size={45} />
        <Flex justifyContent="flex-start" flexDirection="column">
          <Skeleton height="20px" width="35px" />

          <Skeleton height="20px" width="48px" />
        </Flex>
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="15px" width="66px" />
        <Skeleton style={{ marginLeft: '4px' }} height="15px" width="65px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="17px" width="91px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="17px" width="91px" />
      </Flex>
      <Flex alignItems="center">
        <Skeleton height="22px" width="48px" />
      </Flex>
    </SizedCard>
  )
}
